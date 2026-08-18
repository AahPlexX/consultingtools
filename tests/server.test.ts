import { describe, expect, it } from "vitest";
import { createServer } from "../src/server.js";

describe("MCP server", () => {
  it("constructs successfully with registered capability tooling", () => {
    expect(() => createServer()).not.toThrow();
  });
});
