import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { strFromU8, unzipSync } from "fflate";
import { describe, expect, it } from "vitest";
import { createHttpHandler } from "../src/http.js";

async function connectedClient() {
  const handler = createHttpHandler();
  const transport = new StreamableHTTPClientTransport(new URL("http://test.local/mcp"), {
    fetch: (url, init) => handler.fetch(new Request(url, init)),
  });
  const client = new Client(
    { name: "docx-template-test", version: "1.0.0" },
    { versionNegotiation: { mode: "auto" } },
  );
  await client.connect(transport);
  return { client, handler };
}

async function templateBytes(): Promise<Buffer> {
  return Packer.toBuffer(
    new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [
                new TextRun("Client: "),
                new TextRun({ text: "{{client}}", bold: true }),
              ],
            }),
            new Paragraph("Recommendation: {{recommendation}}"),
          ],
        },
      ],
    }),
  );
}

async function importDocx(client: Client, bytes: Buffer) {
  const result = await client.callTool({
    name: "import_artifact_inline",
    arguments: {
      name: "report-template.docx",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      dataBase64: bytes.toString("base64"),
    },
  });
  return (result.structuredContent as { artifact: { uri: string; revision: number } }).artifact;
}

function documentXml(blob: string): string {
  const parts = unzipSync(Buffer.from(blob, "base64"), {
    filter: (file) => file.name === "word/document.xml",
  });
  const xml = parts["word/document.xml"];
  if (!xml) throw new Error("fixture lacks word/document.xml");
  return strFromU8(xml);
}

describe("DOCX template tools", () => {
  it("discovers placeholder keys without modifying the artifact", async () => {
    const { client, handler } = await connectedClient();

    try {
      const artifact = await importDocx(client, await templateBytes());
      const result = await client.callTool({
        name: "inspect_docx_template",
        arguments: { artifactUri: artifact.uri },
      });

      expect(result.isError).not.toBe(true);
      expect(result.structuredContent).toEqual({
        artifactUri: artifact.uri,
        revision: 1,
        placeholders: ["client", "recommendation"],
      });
    } finally {
      await client.close();
      await handler.close();
    }
  });

  it("patches only supplied placeholders into a new artifact revision", async () => {
    const { client, handler } = await connectedClient();

    try {
      const artifact = await importDocx(client, await templateBytes());
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
      if (!("blob" in content) || typeof content.blob !== "string") {
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
    const { client, handler } = await connectedClient();

    try {
      const artifact = await importDocx(client, await templateBytes());
      const result = await client.callTool({
        name: "patch_docx_template",
        arguments: {
          artifactUri: artifact.uri,
          expectedRevision: 1,
          values: { missing_placeholder: "value" },
        },
      });

      expect(result.isError).toBe(true);
      expect(result.content).toContainEqual(
        expect.objectContaining({ type: "text", text: expect.stringMatching(/unknown placeholder/i) }),
      );
    } finally {
      await client.close();
      await handler.close();
    }
  });
});
