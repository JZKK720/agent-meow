/**
 * Admin Skills discovery page (``/settings/skills``). Rendered as a Settings
 * sub-category, sibling to Members / Policies / Harnesses.
 *
 * Read-only view of every skill discoverable by your agents: bundled skills
 * (from each built-in agent's ``spec.skills``) and host skills (from
 * ``~/.claude/skills/`` etc.). Each row shows the source (bundle vs. host),
 * the description, and — for blocked skills — a badge + a deep-link into the
 * Policies page (the existing ``block_skills`` default policy that already
 * works). No mutations on this page; blocking stays where it already lives.
 *
 * Self-gates to admins via ``resolveIdentity`` / ``getCurrentIsAdmin`` (same
 * pattern as HarnessesPage / PoliciesPage; works under OIDC too). The server
 * route also admin-gates, so the client gate is UX only.
 */

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FileCodeIcon, FolderGitIcon, RefreshCwIcon, ShieldAlertIcon } from "lucide-react";
import { PageScroll } from "@/components/PageScroll";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/routing";
import { useAdminSkills, type SkillAdminEntry } from "@/hooks/useAdminCatalog";
import { getCurrentIsAdmin, resolveIdentity } from "@/lib/identity";

export function SkillsPage() {
  const { t } = useTranslation();
  const [meIsAdmin, setMeIsAdmin] = useState<boolean | null>(null);
  const { data: skills = [], refetch, isFetching } = useAdminSkills();

  // Admin probe via the mode-agnostic ``/v1/me`` identity (works under OIDC
  // too). resolveIdentity handles the login redirect when unauthenticated.
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
        <h1 className="mb-2 text-2xl font-semibold">{t("skills.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("skills.noPermission")}</p>
      </div>
    );
  }

  return (
    <PageScroll contentClassName="px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("skills.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("skills.description")}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void refetch()}
          disabled={isFetching}
          data-testid="skills-refresh"
          className="shrink-0"
        >
          <RefreshCwIcon className={isFetching ? "size-4 animate-spin" : "size-4"} />
          {t("skills.refresh", "Refresh")}
        </Button>
      </div>

      {skills.length > 0 && (
        <div className="flex flex-col gap-2">
          {skills.map((s) => (
            <SkillRow key={`${s.source}:${s.name}`} skill={s} t={t} />
          ))}
        </div>
      )}

      {skills.length === 0 && (
        <p className="text-sm text-muted-foreground">{t("skills.noneConfigured")}</p>
      )}

      <div className="mt-6 rounded-md border border-border bg-muted/40 px-4 py-3 text-sm">
        <p className="font-medium">{t("skills.addFooter")}</p>
        <ul className="mt-1 list-disc pl-5 text-[12px] text-muted-foreground">
          <li>
            <code>{"<agent-bundle>/skills/<name>/SKILL.md"}</code>
          </li>
          <li>
            <code>{"~/.claude/skills/<name>/SKILL.md"}</code>
          </li>
          <li>
            <code>{"~/.codex/skills/<name>/SKILL.md"}</code>
          </li>
        </ul>
        <p className="mt-2 text-[12px] text-muted-foreground">{t("skills.blockFooter")}</p>
      </div>
    </PageScroll>
  );
}

function SkillRow({
  skill,
  t,
}: {
  skill: SkillAdminEntry;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const isBundle = skill.source === "bundle";
  return (
    <div className="rounded-md border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {isBundle ? (
              <FileCodeIcon className="size-4 shrink-0 text-muted-foreground" />
            ) : (
              <FolderGitIcon className="size-4 shrink-0 text-muted-foreground" />
            )}
            <span className="text-sm font-medium">{skill.name}</span>
          </div>
          {skill.description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{skill.description}</p>
          )}
          {skill.source_path && (
            <p className="mt-0.5 text-[11px] text-muted-foreground/70">
              {skill.source_path}
            </p>
          )}
          {isBundle && skill.bundled_in_agents.length > 0 && (
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {t("skills.bundledIn", { count: skill.bundled_in_agents.length })}
            </p>
          )}
        </div>
        {skill.blocked && (
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] text-destructive">
              <ShieldAlertIcon className="size-3" />
              {t("skills.blocked")}
            </span>
            {skill.blocked_by_policy && (
              <Link
                to="/settings/policies"
                className="text-[11px] text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
              >
                {t("skills.manage")}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}