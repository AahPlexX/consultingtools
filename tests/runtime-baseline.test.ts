import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const packageJson = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
) as {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

const serverSource = readFileSync(new URL("../src/server.ts", import.meta.url), "utf8");
const stdioSource = readFileSync(new URL("../src/stdio.ts", import.meta.url), "utf8");

describe("current runtime baseline", () => {
  it("uses the stable MCP v2 server package instead of the legacy monolithic SDK", () => {
    expect(packageJson.dependencies?.["@modelcontextprotocol/server"]).toBe("2.0.0");
    expect(packageJson.dependencies?.["@modelcontextprotocol/sdk"]).toBeUndefined();
    expect(serverSource).toContain('from "@modelcontextprotocol/server"');
  });

  it("serves stdio through the modern protocol negotiation entry point", () => {
    expect(stdioSource).toContain('import { serveStdio } from "@modelcontextprotocol/server/stdio"');
    expect(stdioSource).toContain("await serveStdio(() => createServer());");
    expect(stdioSource).not.toContain("StdioServerTransport");
  });

  it("pins the verified supporting toolchain", () => {
    expect(packageJson.dependencies?.zod).toBe("4.4.3");
    expect(packageJson.devDependencies?.typescript).toBe("7.0.2");
    expect(packageJson.devDependencies?.vitest).toBe("4.1.10");
    expect(packageJson.devDependencies?.["@types/node"]).toBe("24.13.3");
  });
});
