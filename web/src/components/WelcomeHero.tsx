import { useTranslation } from "react-i18next";
import { WelcomeMascot } from "@/components/icons/WelcomeMascot";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { cn } from "@/lib/utils";

/**
 * WelcomeHero — the first-touch greeting surface for a new conversation.
 * Renders the waving 橘宝 mascot at 72px with a gentle bob animation,
 * a gradient bubble (cream → peach in light mode, ember tint in dark),
 * and a locale-aware headline. Only shown for the very first assistant
 * message in a conversation — subsequent messages use the standard
 * assistant bubble styling.
 */
export function WelcomeHero({ className }: { className?: string }) {
  const { t } = useTranslation();

  return (
    <Message from="assistant" className={cn("welcome-hero max-w-3xl", className)}>
      <div className="flex items-start gap-3">
        <div className="welcome-hero-avatar">
          <WelcomeMascot className="h-full w-full" />
        </div>
        <MessageContent className="welcome-hero-bubble rounded-2xl px-4 py-3">
          <div className="welcome-hero-headline mb-1.5">{t("newChat.welcomeHeroTitle")}</div>
          <p className="text-[0.9375rem] leading-6 text-foreground">
            {t("newChat.welcomeHeroBody")}
          </p>
        </MessageContent>
      </div>
    </Message>
  );
}
