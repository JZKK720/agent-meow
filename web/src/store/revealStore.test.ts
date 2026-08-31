import { describe, expect, it, beforeEach } from "vitest";
import { useRevealStore } from "./revealStore";

describe("revealStore", () => {
  beforeEach(() => {
    useRevealStore.setState({ pending: {} });
  });

  it("queues a reveal request and claims it one-shot", () => {
    useRevealStore.getState().reveal("s1", {
      paths: ["a/b.jpg", "c/d.png"],
      tab: "images",
      query: "cat",
    });
    const req = useRevealStore.getState().claim("s1");
    expect(req).not.toBeNull();
    expect(req!.paths).toEqual(["a/b.jpg", "c/d.png"]);
    expect(req!.tab).toBe("images");
    expect(req!.query).toBe("cat");
    expect(typeof req!.queuedAt).toBe("number");
    // Claim is destructive — a second claim returns null.
    expect(useRevealStore.getState().claim("s1")).toBeNull();
  });

  it("returns null for a session with no pending reveal", () => {
    expect(useRevealStore.getState().claim("nope")).toBeNull();
  });

  it("keeps per-session reveals independent", () => {
    useRevealStore.getState().reveal("s1", { paths: ["x"], tab: "files", query: "a" });
    useRevealStore.getState().reveal("s2", { paths: ["y"], tab: "images", query: "b" });
    expect(useRevealStore.getState().claim("s1")!.paths).toEqual(["x"]);
    expect(useRevealStore.getState().claim("s2")!.paths).toEqual(["y"]);
  });
});
