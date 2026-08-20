import { MeowCatIcon } from "@/components/icons/MeowCatIcon";
import { cn } from "@/lib/utils";

/**
 * AssistantAvatar — the persistent MeowCat mascot beside every assistant
 * reply. Reuses the working-indicator's `meowcat-working` bob + blink
 * animation (index.css) so the avatar feels alive without introducing a
 * second motion vocabulary. Sized to align with the first line of the
 * assistant bubble's prose.
 */
export function AssistantAvatar({ className }: { className?: string }) {
  return (
    <MeowCatIcon
      aria-hidden="true"
      className={cn("meowcat-working h-7 w-auto shrink-0 text-brand-primary", className)}
    />
  );
}
