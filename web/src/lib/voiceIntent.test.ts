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

  // Regression: conversational fillers must NOT trigger task mode. The
  // original keyword list matched "帮我"/"给我"/"写"/"开始" as bare
  // substrings, so ordinary chat ("帮我看看天气") was routed to task
  // mode — the user only ever heard the short "好的！" confirmation
  // instead of a spoken reply.
  it("keeps 帮我 + conversational verb as chat", async () => {
    const r = await classifyIntent("帮我看看今天天气怎么样", null, "auto");
    expect(r.intent).toBe("chat");
  });

  it("keeps bare 写 (write) conversational as chat", async () => {
    const r = await classifyIntent("你写好了吗", null, "auto");
    expect(r.intent).toBe("chat");
  });

  it("keeps 开始 (start) conversational as chat", async () => {
    const r = await classifyIntent("开始下雨了", null, "auto");
    expect(r.intent).toBe("chat");
  });

  it("keeps 给我 (give me) filler as chat", async () => {
    const r = await classifyIntent("给我讲个笑话吧", null, "auto");
    expect(r.intent).toBe("chat");
  });

  it("keeps English 'write' without an object as chat", async () => {
    const r = await classifyIntent("did you write that down", null, "auto");
    expect(r.intent).toBe("chat");
  });

  it("keeps English 'make sure' as chat", async () => {
    const r = await classifyIntent("make sure you lock the door", null, "auto");
    expect(r.intent).toBe("chat");
  });

  it("still routes explicit Chinese commands to task", async () => {
    const r = await classifyIntent("帮我创建一个新的配置文件", null, "auto");
    expect(r.intent).toBe("task");
  });

  it("still routes 写一个 (write a…) to task", async () => {
    const r = await classifyIntent("写一个Python脚本", null, "auto");
    expect(r.intent).toBe("task");
  });

  it("still routes explicit English commands to task", async () => {
    const r = await classifyIntent("write a python script for me", null, "auto");
    expect(r.intent).toBe("task");
  });
});
