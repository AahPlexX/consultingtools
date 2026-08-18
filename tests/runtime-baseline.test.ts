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
const httpSource = readFileSync(new URL("../src/http.ts", import.meta.url), "utf8");
const artifactFormatSource = readFileSync(
  new URL("../src/artifacts/format.ts", import.meta.url),
  "utf8",
);
const docxTemplateSource = readFileSync(
  new URL("../src/artifacts/docx-template.ts", import.meta.url),
  "utf8",
);

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

  it("serves remote MCP through the modern web-standard handler entry point", () => {
    expect(packageJson.devDependencies?.["@modelcontextprotocol/client"]).toBe("2.0.0");
    expect(httpSource).toContain("createMcpHandler");
    expect(httpSource).toContain("hostHeaderValidationResponse");
    expect(httpSource).toContain("originValidationResponse");
  });

  it("uses the governed bounded ZIP inspection dependency for Office package classification", () => {
    expect(packageJson.dependencies?.fflate).toBe("0.8.3");
    expect(artifactFormatSource).toContain('from "fflate"');
    expect(artifactFormatSource).toContain('file.name === "[Content_Types].xml"');
    expect(artifactFormatSource).toContain("file.originalSize <= MAX_CONTENT_TYPES_BYTES");
  });

  it("uses the governed DOCX package only for placeholder-driven document patching", () => {
    expect(packageJson.dependencies?.docx).toBe("9.7.1");
    expect(docxTemplateSource).toContain("patchDetector");
    expect(docxTemplateSource).toContain("patchDocument");
  });

  it("pins the verified supporting toolchain", () => {
    expect(packageJson.dependencies?.zod).toBe("4.4.3");
    expect(packageJson.devDependencies?.typescript).toBe("7.0.2");
    expect(packageJson.devDependencies?.vitest).toBe("4.1.10");
    expect(packageJson.devDependencies?.["@types/node"]).toBe("24.13.3");
  });
});
