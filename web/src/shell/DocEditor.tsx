// DocEditor — full-pane rich-text editor for a single document, using
// Tiptap (ProseMirror kernel). Loads a document's markdown content,
// edits it, and saves back via PATCH /v1/sessions/{id}/resources/documents/{docId}.
//
// Tiptap extensions used (all already in web/package.json):
//   @tiptap/react, @tiptap/starter-kit, @tiptap/extension-link,
//   @tiptap/extension-image, @tiptap/markdown (for markdown roundtrip).

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Markdown } from "@tiptap/markdown";
import {
  BoldIcon,
  ItalicIcon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
  CodeIcon,
  Heading2Icon,
  LinkIcon,
  SaveIcon,
  XIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDocument, useUpdateDocument } from "@/hooks/useDocuments";
import { useTranslation } from "react-i18next";

interface DocEditorProps {
  conversationId: string;
  documentId: string;
  onClose: () => void;
}

/** Toolbar button that toggles a Tiptap mark/node. */
function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("size-7", active && "bg-muted text-foreground")}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export function DocEditor({ conversationId, documentId, onClose }: DocEditorProps) {
  const { data: doc, isLoading } = useDocument(conversationId, documentId);
  const updateDoc = useUpdateDocument(conversationId);
  const { t } = useTranslation();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const lastSavedMdRef = useRef<string>("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
      Markdown,
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-0 flex-1 overflow-y-auto px-6 py-4",
      },
    },
  });

  // Load document content into the editor when it arrives.
  useEffect(() => {
    if (!editor || !doc) return;
    if (editor.isDestroyed) return;
    const md = doc.contentMd ?? "";
    if (md !== lastSavedMdRef.current) {
      editor.commands.setContent(md);
      lastSavedMdRef.current = md;
    }
  }, [editor, doc]);

  const handleSave = useCallback(() => {
    if (!editor || !doc) return;
    const md = (editor.storage.markdown as { getMarkdown?: () => string })?.getMarkdown?.() ?? editor.getText();
    if (md === lastSavedMdRef.current) return;
    setSaveStatus("saving");
    updateDoc.mutate(
      { documentId: doc.id, contentMd: md },
      {
        onSuccess: (updated) => {
          lastSavedMdRef.current = updated.contentMd ?? md;
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 1500);
        },
        onError: () => {
          setSaveStatus("error");
        },
      },
    );
  }, [editor, doc, updateDoc]);

  // ⌘S / Ctrl+S to save.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleSave]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        {t("docs.loadingDocument")}
      </div>
    );
  }
  if (!doc) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-destructive">
        {t("docs.notFound")}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header: title + save + close */}
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2">
        <input
          type="text"
          value={doc.title}
          onChange={(e) => {
            // Title edits save on blur via the save button; the title is
            // part of the doc and saved alongside content.
            if (!editor) return;
            // Stash the new title on the editor's storage for the next save.
            (editor.storage as unknown as Record<string, unknown>)._pendingTitle = e.target.value;
          }}
          className="min-w-0 flex-1 bg-transparent text-sm font-medium text-foreground focus:outline-none"
          aria-label="Document title"
        />
        <span className="shrink-0 text-xs text-muted-foreground">
          {saveStatus === "saving" && t("docs.saving")}
          {saveStatus === "saved" && t("docs.saved")}
          {saveStatus === "error" && t("docs.saveFailed")}
          {saveStatus === "idle" && `v${doc.version}`}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label={t("docs.save")}
          onClick={handleSave}
          disabled={updateDoc.isPending}
        >
          <SaveIcon className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label={t("docs.close")}
          onClick={onClose}
        >
          <XIcon className="size-4" />
        </Button>
      </div>

      {/* Toolbar */}
      {editor && (
        <div className="flex shrink-0 items-center gap-0.5 border-b border-border px-2 py-1">
          <ToolbarButton
            label={t("docs.bold")}
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <BoldIcon className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label={t("docs.italic")}
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <ItalicIcon className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label={t("docs.heading2")}
            active={editor.isActive("heading", { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2Icon className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label={t("docs.bulletList")}
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <ListIcon className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label={t("docs.orderedList")}
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrderedIcon className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label={t("docs.quote")}
            active={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <QuoteIcon className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label={t("docs.codeBlock")}
            active={editor.isActive("codeBlock")}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          >
            <CodeIcon className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label={t("docs.link")}
            active={editor.isActive("link")}
            onClick={() => {
              const url = window.prompt(t("docs.urlPrompt"));
              if (url) editor.chain().focus().setLink({ href: url }).run();
            }}
          >
            <LinkIcon className="size-4" />
          </ToolbarButton>
        </div>
      )}

      {/* Editor body */}
      <div className="min-h-0 flex-1 overflow-hidden">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
}