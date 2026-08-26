import { afterEach, describe, expect, it } from "vitest";

import { getCliServerUrl, setAgentMeowHostConfig } from "./host";

afterEach(() => {
  setAgentMeowHostConfig({});
});

describe("getCliServerUrl", () => {
  it("returns window.location.origin when no suffix is configured", () => {
    setAgentMeowHostConfig({});
    const url = getCliServerUrl();
    expect(url).toBe(window.location.origin);
  });

  it("appends the configured cliServerUrlSuffix", () => {
    setAgentMeowHostConfig({ cliServerUrlSuffix: "/api/2.0/agent-meow" });
    const url = getCliServerUrl();
    expect(url).toBe(`${window.location.origin}/api/2.0/agent-meow`);
  });

  it("handles an empty string suffix the same as no suffix", () => {
    setAgentMeowHostConfig({ cliServerUrlSuffix: "" });
    expect(getCliServerUrl()).toBe(window.location.origin);
  });
});
