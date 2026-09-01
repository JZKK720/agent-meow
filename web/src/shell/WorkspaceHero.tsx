"use client";

// WorkspaceHero — the landing hero frame (plan-040 Phase 0, Task 5).
// Extracted verbatim from NewChatLandingScreen: the greeting row (mascot +
// localized title) and the first-boot checklist, inside the max-width
// centering container. Pure move: identical rendered DOM. Capability bricks
// and SkillPills slot in as children (Phase 2 adds the real bricks; Phase 0
// keeps the current children — the greeting + checklist are part of the
// frame itself, so the landing composes the frame with no extra children
// yet).

import type { ReactNode } from "react";
import { MeowCatMascot } from "@/components/icons/MeowCatMascot";
import { FirstBootChecklist } from "@/components/FirstBootChecklist";
import { CHAT_COLUMN_WIDTH } from "@/shell/SessionComposer";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@/lib/routing";

/**
 * The hero *frame* only: greeting row (mascot + t("newChat.title")),
 * FirstBootChecklist, and the max-width/centering container. Children
 * (capability bricks, SkillPills) slot in as direct flex children of the
 * container, beneath the checklist.
 */
export function WorkspaceHero(props: { children?: ReactNode }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    // Width = the shared chat column (CHAT_COLUMN_WIDTH) so the landing
    // composer's content width equals the in-session composer's — the
    // unified page swaps hero→session with NO width jump. px-6 mirrors the
    // session column's gutters (mx-auto w-full px-6 + CHAT_COLUMN_WIDTH);
    // px-4 on phones keeps the composer off the viewport edges.
    // Previously max-w-[840px] px-4/md:px-10 → 760px content, which jumped
    // to 720px when the hero collapsed. (unified-surface-audit finding 1.)
    <div
      data-testid="workspace-hero"
      className={cn(
        "flex w-full flex-col items-center gap-6 px-4 pt-6 pb-8 md:select-none md:px-6",
        CHAT_COLUMN_WIDTH,
      )}
    >
      <div className="flex flex-col items-center gap-3.5 sm:flex-row">
        <MeowCatMascot className="h-16 w-auto shrink-0 md:h-20" />
        <h1 className="text-center text-3xl font-medium tracking-[-0.03em] text-foreground sm:text-left">
          {t("newChat.title")}
        </h1>
      </div>
      {/* First-boot stack checklist — shows once per browser while the
          Docker stack components (Hermes, Ollama) come up. Dismissed
          state persists in localStorage; degrades to nothing on
          non-Docker deploys (all rows ok → auto-dismissable card). */}
      <FirstBootChecklist onOpenSettings={() => navigate("/settings")} />
      {props.children}
    </div>
  );
}