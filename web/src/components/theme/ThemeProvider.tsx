import type { ReactNode } from "react";
import { useEffect } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * App-wide theme provider configured for Tailwind's `.dark` class variant.
 *
 * Defaults to system preference and stores explicit user selection under
 * an web-specific key so it does not collide with unrelated local apps
 * on the same host.
 *
 * Also sets `data-brand="colorfire"` (the default product line) on the
 * document root so the brand CSS token variants resolve to the ColorFire
 * ember palette. A future server-side `brand` field in `/v1/info` can
 * override this to `"meow"` for the Meow laptop product line.
 *
 * @param children React tree that should inherit theme context.
 * @returns React provider wrapping the app.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Default to ColorFire. If the server reports a different brand via
    // /v1/info in a future API addition, this attribute is updated there.
    if (!document.documentElement.getAttribute("data-brand")) {
      document.documentElement.setAttribute("data-brand", "colorfire");
    }
  }, []);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="web-theme"
    >
      {children}
    </NextThemesProvider>
  );
}
