import { describe, expect, it, vi, afterEach } from "vitest";
import {
  MicUnavailableError,
  acquireMicStream,
  isMicCaptureAvailable,
  micUnavailableReason,
} from "./micPermission";

describe("micPermission", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe("isMicCaptureAvailable", () => {
    it("returns true in a secure context with getUserMedia", () => {
      vi.stubGlobal("isSecureContext", true);
      Object.defineProperty(global.navigator, "mediaDevices", {
        value: { getUserMedia: vi.fn() },
        configurable: true,
      });
      expect(isMicCaptureAvailable()).toBe(true);
    });

    it("returns false in an insecure context (LAN IP over HTTP)", () => {
      vi.stubGlobal("isSecureContext", false);
      Object.defineProperty(global.navigator, "mediaDevices", {
        value: { getUserMedia: vi.fn() },
        configurable: true,
      });
      expect(isMicCaptureAvailable()).toBe(false);
    });

    it("returns false when mediaDevices is undefined", () => {
      vi.stubGlobal("isSecureContext", true);
      Object.defineProperty(global.navigator, "mediaDevices", {
        value: undefined,
        configurable: true,
      });
      expect(isMicCaptureAvailable()).toBe(false);
    });
  });

  describe("micUnavailableReason", () => {
    it("returns null when capture is available", () => {
      vi.stubGlobal("isSecureContext", true);
      Object.defineProperty(global.navigator, "mediaDevices", {
        value: { getUserMedia: vi.fn() },
        configurable: true,
      });
      expect(micUnavailableReason()).toBeNull();
    });

    it("returns a message mentioning HTTPS/localhost when insecure", () => {
      vi.stubGlobal("isSecureContext", false);
      Object.defineProperty(global.navigator, "mediaDevices", {
        value: { getUserMedia: vi.fn() },
        configurable: true,
      });
      const reason = micUnavailableReason();
      expect(reason).not.toBeNull();
      expect(reason!.toLowerCase()).toMatch(/localhost|https|secure/);
    });
  });

  describe("acquireMicStream", () => {
    it("delegates to getUserMedia when available", async () => {
      const fakeStream = { id: "fake" } as unknown as MediaStream;
      const gum = vi.fn().mockResolvedValue(fakeStream);
      vi.stubGlobal("isSecureContext", true);
      Object.defineProperty(global.navigator, "mediaDevices", {
        value: { getUserMedia: gum },
        configurable: true,
      });
      const stream = await acquireMicStream({ audio: true });
      expect(stream).toBe(fakeStream);
      expect(gum).toHaveBeenCalledWith({ audio: true });
    });

    it("throws MicUnavailableError in an insecure context", async () => {
      vi.stubGlobal("isSecureContext", false);
      Object.defineProperty(global.navigator, "mediaDevices", {
        value: undefined,
        configurable: true,
      });
      await expect(acquireMicStream({ audio: true })).rejects.toThrow(
        MicUnavailableError,
      );
    });
  });
});
