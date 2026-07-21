/**
 * Admin Harnesses dashboard (``/settings/harnesses``). Rendered as a Settings
 * sub-category, sibling to Members / Policies.
 *
 * Read-only status board for every built-in harness: install + login status
 * on this host, the declared capabilities, and a copy-pasteable install
 * command. Harnesses are built-in code; the only host-side action is running
 * ``meow setup`` (the wizard), so the page surfaces a copy command instead of
 * a remote install button — installing a vendor CLI on a server box from a
 * browser is a footgun, and the competitor (Claude Code) does the same.
 *
 * Self-gates to admins via ``resolveIdentity`` / ``getCurrentIsAdmin`` (same
 * pattern as PoliciesPage; works under OIDC too). The server route also
 * admin-gates, so the client gate is UX only.
 */

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckIcon, XIcon } from "lucide-react";
import { PageScroll } from "@/components/PageScroll";
import { Button } from "@/components/ui/button";
import { useAdminHarnesses, type HarnessAdminEntry } from "@/hooks/useAdminCatalog";
import { getCurrentIsAdmin, resolveIdentity } from "@/lib/identity";

function statusGlyph(ok: boolean) {
  return ok ? (
    <CheckIcon className="size-4 text-green-600" />
  ) : (
    <XIcon className="size-4 text-red-600" />
  );
}

function copyToClipboard(text: string) {
  void navigator.clipboard.writeText(text);
}

export function HarnessesPage() {
  const { t } = useTranslation();
  const [meIsAdmin, setMeIsAdmin] = useState<boolean | null>(null);
  const { data: harnesses = [] } = useAdminHarnesses();

  // Admin probe via the mode-agnostic ``/v1/me`` identity (works under OIDC
  // too, unlike the accounts-only ``/auth/me``). resolveIdentity handles the
  // login redirect when unauthenticated, so we only set the admin flag here.
  useEffect(() => {
    void (async () => {
      const userId = await resolveIdentity();
      if (userId === null) return;
      setMeIsAdmin(getCurrentIsAdmin());
    })();
  }, []);

  if (meIsAdmin === null) {
    return (
      <div className="flex min-h-full items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (meIsAdmin === false) {
    return (
      <div className="mx-auto w-full max-w-2xl px-6 py-12">
        <h1 className="mb-2 text-2xl font-semibold">{t("harnesses.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("harnesses.noPermission")}</p>
      </div>
    );
  }

  return (
    <PageScroll contentClassName="px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{t("harnesses.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("harnesses.description")}</p>
      </div>

      {harnesses.length > 0 && (
        <div className="flex flex-col gap-2">
          {harnesses.map((h) => (
            <HarnessRow key={h.id} harness={h} t={t} />
          ))}
        </div>
      )}

      {harnesses.length === 0 && (
        <p className="text-sm text-muted-foreground">{t("harnesses.noneConfigured")}</p>
      )}

      <div className="mt-6 rounded-md border border-border bg-muted/40 px-4 py-3 text-sm">
        <p className="font-medium">{t("harnesses.installFooter")}</p>
        <code className="mt-1 block text-[12px] text-muted-foreground">meow setup</code>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2"
          onClick={() => copyToClipboard("meow setup")}
        >
          {t("harnesses.copySetup")}
        </Button>
      </div>
    </PageScroll>
  );
}

function HarnessRow({
  harness,
  t,
}: {
  harness: HarnessAdminEntry;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const installed = harness.install_status === "installed";
  const loggedIn = harness.login_status === "logged_in";
  const caps = harness.capabilities as Record<string, unknown>;
  const mode = typeof caps.integration_mode === "string" ? caps.integration_mode : null;
  return (
    <div className="rounded-md border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{harness.label}</span>
            <code className="text-[11px] text-muted-foreground">{harness.id}</code>
          </div>
          {harness.binary && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              binary: <code>{harness.binary}</code>
            </p>
          )}
          {mode && (
            <p className="mt-0.5 text-xs text-muted-foreground">{mode}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-3 text-xs">
          <span className="flex items-center gap-1">
            {statusGlyph(installed)}
            <span className="text-muted-foreground">
              {installed ? "installed" : "missing"}
            </span>
          </span>
          <span className="flex items-center gap-1">
            {harness.login_status === "n/a" ? (
              <span className="text-muted-foreground">n/a</span>
            ) : (
              <>
                {statusGlyph(loggedIn)}
                <span className="text-muted-foreground">
                  {loggedIn ? "logged in" : "logged out"}
                </span>
              </>
            )}
          </span>
        </div>
      </div>
      {harness.install_command && (
        <div className="mt-2 flex items-center gap-2">
          <code className="flex-1 truncate rounded bg-muted px-2 py-1 text-[11px]">
            {harness.install_command}
          </code>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => copyToClipboard(harness.install_command!)}
          >
            {t("harnesses.copy")}
          </Button>
        </div>
      )}
      {harness.auth_hint && (
        <p className="mt-1 text-[11px] text-muted-foreground">{harness.auth_hint}</p>
      )}
    </div>
  );
}