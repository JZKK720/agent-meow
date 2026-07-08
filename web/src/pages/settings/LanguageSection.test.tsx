import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import i18n from "@/lib/i18n";
import { LanguageSection } from "./LanguageSection";

describe("LanguageSection", () => {
  beforeEach(async () => {
    window.localStorage.clear();
    await i18n.changeLanguage("en");
  });

  it("switches the UI language reactively", async () => {
    render(<LanguageSection />);

    expect(screen.getByRole("heading", { name: "Language" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /中文/ }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "语言" })).toBeInTheDocument();
    });
    expect(i18n.language).toBe("zh-CN");
  });
});