import { describe, expect, it } from "vitest";
import { classifyIntent } from "./voiceIntent";

describe("classifyIntent (keyword-only)", () => {
  it("returns chat for empty input", async () => {
    const r = await classifyIntent("", null, "auto");
    expect(r.intent).toBe("chat");
    expect(r.confidence).toBe(1.0);
  });

  it("routes English action verbs to task", async () => {
    const r = await classifyIntent("create a landing page for me", null, "auto");
    expect(r.intent).toBe("task");
    expect(r.confidence).toBeGreaterThanOrEqual(0.6);
  });

  it("routes Chinese action verbs to task", async () => {
    const r = await classifyIntent("帮我写一个测试", null, "auto");
    expect(r.intent).toBe("task");
    expect(r.confidence).toBeGreaterThanOrEqual(0.6);
  });

  it("routes greetings to chat", async () => {
    const r = await classifyIntent("hello, how are you today", null, "auto");
    expect(r.intent).toBe("chat");
  });

  it("routes conversational questions to chat", async () => {
    const r = await classifyIntent("你觉得今天的天气怎么样", null, "auto");
    expect(r.intent).toBe("chat");
  });

  it("resolves instantly (no network round-trip)", async () => {
    const t0 = performance.now();
    await classifyIntent("build a dashboard with charts and tables", null, "auto");
    const elapsed = performance.now() - t0;
    // Keyword classification is synchronous; anything over 50ms would
    // indicate a regression back to a network call.
    expect(elapsed).toBeLessThan(50);
  });
});
