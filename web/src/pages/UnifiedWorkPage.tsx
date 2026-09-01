import type { ReactNode } from "react";
import { useChatStore } from "@/store/chatStore";
import { cn } from "@/lib/utils";

/**
 * The unified workspace page (plan-040 §3.1): hero region when idle,
 * transcript region when a session is active, and the composer rendered
 * by the parent ONCE — never unmounted across the transition.
 *
 * The hero collapse animates compositor props only (translateY + scaleY +
 * opacity, 200ms) — never `height` (baseline-ui rule). When collapsed the
 * region is `aria-hidden` and pointer-inert; the composer below stays
 * mounted, which is what structurally deletes the voice G2 teardown.
 */
export function UnifiedWorkPage(props: {
  hero: ReactNode;
  stream: ReactNode;
  composer: ReactNode;
}) {
  const conversationId = useChatStore((s) => s.conversationId);
  const isSessionActive = conversationId != null && conversationId !== "";

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col" data-testid="unified-work-page">
      <div
        className={cn(
          "grid transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none",
          isSessionActive
            ? "pointer-events-none -translate-y-2 scale-y-[0.98] opacity-0"
            : "translate-y-0 scale-y-100 opacity-100",
        )}
        aria-hidden={isSessionActive}
      >
        {!isSessionActive ? props.hero : null}
      </div>
      {isSessionActive ? <div className="flex min-h-0 flex-1 flex-col">{props.stream}</div> : null}
      {props.composer}
    </div>
  );
}