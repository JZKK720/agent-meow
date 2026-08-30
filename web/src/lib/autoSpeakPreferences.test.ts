import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_AUTO_SPEAK_REPLIES,
  readAutoSpeakReplies,
  writeAutoSpeakReplies,
} from "./autoSpeakPreferences";

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("autoSpeakPreferences", () => {
  it("defaults to ON — replies are spoken unless the user opts out", () => {
    // The dictation→composer path used to speak replies through the voice
    // pipeline; routing dictation at the text-only server path dropped that.
    // Auto-speak is the replacement, so it ships on: with nothing stored,
    // read must report the feature ON.
    expect(DEFAULT_AUTO_SPEAK_REPLIES).toBe(true);
    expect(readAutoSpeakReplies()).toBe(true);
  });

  it("round-trips both boolean values", () => {
    writeAutoSpeakReplies(false);
    expect(readAutoSpeakReplies()).toBe(false);

    writeAutoSpeakReplies(true);
    expect(readAutoSpeakReplies()).toBe(true);
  });

  it('only the exact stored "false" disables it (defensive against hand edits)', () => {
    // Any non-"false" value keeps auto-speak on — a corrupt or stale entry
    // must not silently mute replies.
    localStorage.setItem("agent-meow:auto-speak-replies", "0");
    expect(readAutoSpeakReplies()).toBe(true);

    localStorage.setItem("agent-meow:auto-speak-replies", "no");
    expect(readAutoSpeakReplies()).toBe(true);

    localStorage.setItem("agent-meow:auto-speak-replies", "false");
    expect(readAutoSpeakReplies()).toBe(false);
  });

  it("never throws when storage is inaccessible", () => {
    // Private-mode / quota failures surface as throws from the Storage API.
    // Both helpers must swallow them — a broken preference must not break
    // the chat page.
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota exceeded");
    });
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("access denied");
    });
    expect(() => writeAutoSpeakReplies(false)).not.toThrow();
    expect(readAutoSpeakReplies()).toBe(true);
  });
});
