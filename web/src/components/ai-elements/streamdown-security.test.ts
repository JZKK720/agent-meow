import { describe, expect, it } from "vitest";

import {
  CHAT_IMAGE_ALLOWLIST,
  MAX_DATA_IMAGE_BYTES,
} from "./streamdown-security";

describe("chat image allowlist", () => {
  it("allows first-party session resource paths", () => {
    const url = "/sessions/abc123/resources/images/img-1.png";
    expect(
      CHAT_IMAGE_ALLOWLIST.some((prefix) => url.startsWith(prefix)),
    ).toBe(true);
  });

  it("allows API-prefixed session resource paths", () => {
    const url = "/v1/sessions/abc123/resources/images/img-1.png";
    expect(
      CHAT_IMAGE_ALLOWLIST.some((prefix) => url.startsWith(prefix)),
    ).toBe(true);
  });

  it("allows data:image URIs (agent-generated charts)", () => {
    const url = "data:image/png;base64,iVBORw0KGgo=";
    expect(
      CHAT_IMAGE_ALLOWLIST.some((prefix) => url.startsWith(prefix)),
    ).toBe(true);
  });

  it.each([
    "https://attacker.example/log.png?d=c2VjcmV0",
    "http://evil.example/pixel.gif",
    "//cdn.example/track.png",
    "data:text/html;base64,PHNjcmlwdD4=",
    "javascript:alert(1)",
  ])("blocks non-first-party URL: %s", (url) => {
    expect(
      CHAT_IMAGE_ALLOWLIST.some((prefix) => url.startsWith(prefix)),
    ).toBe(false);
  });

  it("blocks data: URIs that are not images", () => {
    const url = "data:application/javascript;base64,YWxlcnQoMSk=";
    expect(
      CHAT_IMAGE_ALLOWLIST.some((prefix) => url.startsWith(prefix)),
    ).toBe(false);
  });

  it("caps data image payloads at ~2MB", () => {
    expect(MAX_DATA_IMAGE_BYTES).toBe(2 * 1024 * 1024);
  });
});
