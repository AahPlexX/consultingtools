import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { unzipSync } from "fflate";
import { describe, expect, it } from "vitest";
import { createHttpHandler } from "../src/http.js";

async function templateBase64(): Promise<string> {
  const document = new Document({
    sections: [
      {
        children: [
          new Paragraph({ children: [new TextRun("Client: {{client}}")]}),
          new Paragraph({ children: [new TextRun("Recommendation: {{recommendation}}")]}),
        ],
      },
    ],
  });
  return (await Packer.toBuffer(document)).toString("base64");
}

function documentXml(base64: string): string {
  const entries = unzipSync(Buffer.from(base64, "base64"));
  const document = entries["word/document.xml"];
  if (!document) throw new Error("DOCX fixture is missing word/document.xml");
  return Buffer.from(document).toString("utf8");
}

describe("DOCX template operations", () => {
  it("inspects placeholder keys without mutating the artifact", async () => {
    const handler = createHttpHandler();
    const transport = new StreamableHTTPClientTransport(new URL("http://test.local/mcp"), {
      fetch: (url, init) => handler.fetch(new Request(url, init)),
    });
    const client = new Client(
      { name: "docx-template-test", version: "1.0.0" },
      { versionNegotiation: { mode: "auto" } },
    );

    try {
      await client.connect(transport);
      const imported = await client.callTool({
        name: "import_artifact_inline",
        arguments: {
          name: "template.docx",
          mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          base64: await templateBase64(),
        },
      });
      const artifact = (imported.structuredContent as { artifact: { uri: string } }).artifact;

      const result = await client.callTool({
        name: "inspect_docx_template",
        arguments: { artifactUri: artifact.uri },
      });

      expect(result.isError).not.toBe(true);
      expect(result.structuredContent).toMatchObject({
        artifactUri: artifact.uri,
        revision: 1,
        placeholders: ["client", "recommendation"],
      });
    } finally {
      await client.close();
      await handler.close();
    }
  });

  it("patches only requested existing placeholders and creates a new revision", async () => {
    const handler = createHttpHandler();
    const transport = new StreamableHTTPClientTransport(new URL("http://test.local/mcp"), {
      fetch: (url, init) => handler.fetch(new Request(url, init)),
    });
    const client = new Client(
      { name: "docx-template-test", version: "1.0.0" },
      { versionNegotiation: { mode: "auto" } },
    );

    try {
      await client.connect(transport);
      const imported = await client.callTool({
        name: "import_artifact_inline",
        arguments: {
          name: "template.docx",
          mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          base64: await templateBase64(),
        },
      });
      const artifact = (imported.structuredContent as { artifact: { uri: string } }).artifact;

      const result = await client.callTool({
        name: "patch_docx_template",
        arguments: {
          artifactUri: artifact.uri,
          expectedRevision: 1,
          values: {
            client: "Northwind Health",
            recommendation: "Expand the highest-margin service line.",
          },
          keepOriginalStyles: true,
        },
      });

      expect(result.isError).not.toBe(true);
      expect(result.structuredContent).toMatchObject({
        artifact: { uri: artifact.uri, revision: 2 },
        replacedPlaceholders: ["client", "recommendation"],
        remainingPlaceholders: [],
      });

      const resource = await client.readResource({ uri: artifact.uri });
      const content = resource.contents[0];
      if (!content || !("blob" in content) || typeof content.blob !== "string") {
        throw new Error("DOCX resource did not return a binary blob");
      }
      const xml = documentXml(content.blob);
      expect(xml).toContain("Northwind Health");
      expect(xml).toContain("Expand the highest-margin service line.");
      expect(xml).not.toContain("{{client}}");
      expect(xml).not.toContain("{{recommendation}}");
    } finally {
      await client.close();
      await handler.close();
    }
  });

  it("rejects unknown replacement keys instead of silently producing a misleading document", async () => {
    const handler = createHttpHandler();
    const transport = new StreamableHTTPClientTransport(new URL("http://test.local/mcp"), {
      fetch: (url, init) => handler.fetch(new Request(url, init)),
    });
    const client = new Client(
      { name: "docx-template-test", version: "1.0.0" },
      { versionNegotiation: { mode: "auto" } },
    );

    try {
      await client.connect(transport);
      const imported = await client.callTool({
        name: "import_artifact_inline",
        arguments: {
          name: "template.docx",
          mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          base64: await templateBase64(),
        },
      });
      const artifact = (imported.structuredContent as { artifact: { uri: string } }).artifact;

      const result = await client.callTool({
        name: "patch_docx_template",
        arguments: {
          artifactUri: artifact.uri,
          expectedRevision: 1,
          values: { missing: "Should fail" },
        },
      });

      expect(result.isError).toBe(true);
      expect(result.content).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: "text",
            text: expect.stringContaining("Unknown DOCX template placeholder"),
          }),
        ]),
      );
    } finally {
      await client.close();
      await handler.close();
    }
  });
});
