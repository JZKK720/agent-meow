// DocsPanel — the right-side rail tab for the agent-meow Docs surface.
// Mirrors FilesPanel.tsx structure: a list of session documents with a
// new-doc button. Selecting a document opens the DocEditor full-pane.
//
// The panel is a pure view — all state (selected doc, open docs) lives in
// AppShell and is passed via props, matching the FilesPanel contract.

import { FileTextIcon, PlusIcon, Trash2Icon, UploadIcon, DownloadIcon } from "lucide-react";
import { useParams } from "@/lib/routing";
import { Button } from "@/components/ui/button";
import { MeowCatMascot } from "@/components/icons/MeowCatMascot";
import { WelcomeMascot } from "@/components/icons/WelcomeMascot";
import { cn } from "@/lib/utils";
import {
  useCreateDocument,
  useDeleteDocument,
  useDocuments,
  useUploadDocumentFile,
} from "@/hooks/useDocuments";
import { getDocumentBinary } from "@/lib/documentsApi";
import { useTranslation } from "react-i18next";

interface DocsPanelProps {
  /** Called when a document is selected for editing. */
  onDocSelect: (docId: string) => void;
  /** Currently selected document id, or null. */
  selectedDocId: string | null;
  /** When provided, renders an X close button (drawer mode). */
  onClose?: () => void;
  /** Frameless mode: drops the rounded card chrome (inline panel). */
  frameless?: boolean;
}

/** Format an epoch-second timestamp as a short relative date. */
function formatRelativeDate(epochSeconds: number): string {
  if (!epochSeconds) return "";
  const d = new Date(epochSeconds * 1000);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

/** Format a byte count as a short human label. */
function formatBytes(bytes: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocsPanel({ onDocSelect, selectedDocId, onClose, frameless }: DocsPanelProps) {
  const { t } = useTranslation();
  const { conversationId } = useParams<{ conversationId: string }>();
  const { data: docs, isLoading, error } = useDocuments(conversationId);
  const createDoc = useCreateDocument(conversationId);
  const deleteDoc = useDeleteDocument(conversationId);
  const uploadDoc = useUploadDocumentFile(conversationId);

  function handleNewDoc() {
    createDoc.mutate(
      { title: t("chat.untitled"), contentMd: "" },
      {
        onSuccess: (doc) => {
          onDocSelect(doc.id);
        },
      },
    );
  }

  function handleUploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      uploadDoc.mutate(file);
    }
    // Reset so re-selecting the same file re-triggers onChange.
    e.target.value = "";
  }

  async function handleDownload(docId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (conversationId == null) return;
    try {
      const { blob, filename } = await getDocumentBinary(conversationId, docId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // The server 404s markdown docs (no binary payload); surface nothing.
    }
  }

  function handleDelete(docId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (window.confirm(t("docs.deleteConfirm"))) {
      deleteDoc.mutate(docId);
    }
  }

  return (
    <div
      className={cn(
        "flex h-full flex-col",
        frameless ? "" : "rounded-lg border border-border bg-card",
      )}
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <MeowCatMascot className="size-5" />
          <span>{t("docs.title")}</span>
        </div>
        <div className="flex items-center gap-1">
          <label
            className={cn(
              "inline-flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground",
              "hover:bg-accent hover:text-accent-foreground",
              uploadDoc.isPending && "animate-pulse",
            )}
            aria-label={t("docs.uploadFile")}
            title={t("docs.uploadFile")}
          >
            <UploadIcon className="size-4" />
            <input type="file" className="sr-only" onChange={handleUploadFile} />
          </label>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label={t("docs.newDocument")}
            onClick={handleNewDoc}
            disabled={createDoc.isPending}
          >
            <PlusIcon className="size-4" />
          </Button>
          {onClose && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label={t("docs.closePanel")}
              onClick={onClose}
            >
              <span className="text-lg leading-none">×</span>
            </Button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {t("common.loading")}
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-destructive">
            {t("docs.loadFailed")}
          </div>
        ) : !docs || docs.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center text-sm text-muted-foreground">
            <WelcomeMascot className="size-16" />
            <p>{t("docs.noDocuments")}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-brand-primary/30 text-brand-primary hover:bg-brand-primary/10"
              onClick={handleNewDoc}
              disabled={createDoc.isPending}
            >
              <PlusIcon className="size-4" /> {t("docs.newDocument")}
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {docs.map((doc) => (
              <li
                key={doc.id}
                className={cn(
                  "group relative flex items-center gap-2 px-3 py-2 hover:bg-muted/50",
                  selectedDocId === doc.id && "bg-muted",
                )}
              >
                <button
                  type="button"
                  className="absolute inset-0 cursor-pointer"
                  aria-label={`Open ${doc.title}`}
                  onClick={() => onDocSelect(doc.id)}
                />
                <FileTextIcon className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-foreground">{doc.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatRelativeDate(doc.updatedAt)} · v{doc.version}
                    {doc.hasBinary && (
                      <>
                        {" · "}
                        <span className="text-brand-primary">{doc.filename}</span>
                        {" "}
                        {formatBytes(doc.bytesSize)}
                      </>
                    )}
                  </div>
                </div>
                {doc.hasBinary && (
                  <button
                    type="button"
                    aria-label={t("docs.download")}
                    className="relative z-10 rounded p-1 text-muted-foreground opacity-0 hover:bg-accent hover:text-accent-foreground group-hover:opacity-100"
                    onClick={(e) => void handleDownload(doc.id, e)}
                  >
                    <DownloadIcon className="size-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  aria-label={t("common.delete")}
                  className="relative z-10 rounded p-1 text-muted-foreground opacity-0 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  onClick={(e) => handleDelete(doc.id, e)}
                >
                  <Trash2Icon className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
