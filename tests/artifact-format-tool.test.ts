import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { strToU8, zipSync } from "fflate";
import { describe, expect, it } from "vitest";
import { createHttpHandler } from "../src/http.js";

async function connectedClient() {
  const handler = createHttpHandler();
  const transport = new StreamableHTTPClientTransport(new URL("http://test.local/mcp"), {
    fetch: (url, init) => handler.fetch(new Request(url, init)),
  });
  const client = new Client(
    { name: "artifact-format-tool-test", version: "1.0.0" },
    { versionNegotiation: { mode: "auto" } },
  );
  await client.connect(transport);
  return { client, handler };
}

function officePackage(mainPart: string, contentType: string): Buffer {
  const types = `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Override PartName="/${mainPart}" ContentType="${contentType}"/></Types>`;
  return Buffer.from(
    zipSync({
      "[Content_Types].xml": strToU8(types),
      [mainPart]: strToU8("fixture"),
    }),
  );
}

async function importBytes(client: Client, bytes: Buffer, mimeType: string) {
  const result = await client.callTool({
    name: "import_artifact_inline",
    arguments: {
      name: "fixture.bin",
      mimeType,
      dataBase64: bytes.toString("base64"),
    },
  });
  return (result.structuredContent as { artifact: { uri: string } }).artifact;
}

describe("inspect_artifact_format", () => {
  it("detects actual bytes independently of a generic declared MIME type", async () => {
    const { client, handler } = await connectedClient();

    try {
      const artifact = await importBytes(
        client,
        Buffer.from("%PDF-1.7\nfixture", "ascii"),
        "application/octet-stream",
      );
      const result = await client.callTool({
        name: "inspect_artifact_format",
        arguments: { artifactUri: artifact.uri },
      });

      expect(result.isError).not.toBe(true);
      expect(result.structuredContent).toMatchObject({
        artifact: { uri: artifact.uri },
        detected: {
          format: "pdf",
          detectedMimeType: "application/pdf",
          container: "pdf",
          macroEnabled: false,
        },
        declaredMimeMatches: null,
      });
    } finally {
      await client.close();
      await handler.close();
    }
  });

  it("flags macro-enabled Office packages and does not treat them as ordinary XLSX", async () => {
    const { client, handler } = await connectedClient();

    try {
      const bytes = officePackage(
        "xl/workbook.xml",
        "application/vnd.ms-excel.sheet.macroEnabled.main+xml",
      );
      const artifact = await importBytes(
        client,
        bytes,
        "application/vnd.ms-excel.sheet.macroenabled.12",
      );
      const result = await client.callTool({
        name: "inspect_artifact_format",
        arguments: { artifactUri: artifact.uri },
      });

      expect(result.structuredContent).toMatchObject({
        detected: { format: "xlsm", macroEnabled: true },
        declaredMimeMatches: true,
      });
      expect(result.content).toContainEqual(
        expect.objectContaining({
          type: "text",
          text: expect.stringMatching(/must not execute/i),
        }),
      );
    } finally {
      await client.close();
      await handler.close();
    }
  });
});
