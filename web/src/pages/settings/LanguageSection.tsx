// LanguageSection — settings section for switching the UI language (EN/ZH).
// Uses react-i18next; the choice is persisted in localStorage.

import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SUPPORTED_LANGUAGES, changeLanguage } from "@/lib/i18n";

// Re-declare Section locally since SettingsPage doesn't export it.
function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export function LanguageSection() {
  const { t, i18n } = useTranslation();
  const current = i18n.language;

  return (
    <Section title={t("settings.language")} description={t("settings.languageDesc")}>
      <div className="flex flex-col gap-2">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <Button
            key={lang.code}
            type="button"
            variant={current === lang.code ? "default" : "outline"}
            className={cn("justify-start gap-2", current === lang.code && "font-medium")}
            onClick={() => changeLanguage(lang.code)}
          >
            <span className="text-base">{lang.flag}</span>
            {lang.label}
            {current === lang.code && (
              <span className="ml-auto text-xs text-muted-foreground">✓</span>
            )}
          </Button>
        ))}
      </div>
    </Section>
  );
}