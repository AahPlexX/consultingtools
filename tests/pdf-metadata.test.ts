import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { createHttpHandler } from "../src/http.js";

async function connectedClient() {
  const handler = createHttpHandler();
  const transport = new StreamableHTTPClientTransport(new URL("http://test.local/mcp"), {
    fetch: (url, init) => handler.fetch(new Request(url, init)),
  });
  const client = new Client(
    { name: "pdf-metadata-test", version: "1.0.0" },
    { versionNegotiation: { mode: "auto" } },
  );
  await client.connect(transport);
  return { client, handler };
}

async function pdfFixture(): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  pdf.addPage([400, 500]);
  pdf.addPage([400, 500]);
  pdf.setTitle("Original title");
  pdf.setAuthor("Original author");
  return Buffer.from(await pdf.save());
}

async function importPdf(client: Client) {
  const result = await client.callTool({
    name: "import_artifact_inline",
    arguments: {
      name: "report.pdf",
      mimeType: "application/pdf",
      dataBase64: (await pdfFixture()).toString("base64"),
    },
  });
  return (result.structuredContent as { artifact: { uri: string; revision: number } }).artifact;
}

describe("PDF metadata tools", () => {
  it("inspects page count and document metadata without modifying the artifact", async () => {
    const { client, handler } = await connectedClient();

    try {
      const artifact = await importPdf(client);
      const result = await client.callTool({
        name: "inspect_pdf",
        arguments: { artifactUri: artifact.uri },
      });

      expect(result.isError).not.toBe(true);
      expect(result.structuredContent).toMatchObject({
        artifactUri: artifact.uri,
        revision: 1,
        pageCount: 2,
        metadata: {
          title: "Original title",
          author: "Original author",
        },
      });
    } finally {
      await client.close();
      await handler.close();
    }
  });

  it("updates only supplied metadata and preserves the page count", async () => {
    const { client, handler } = await connectedClient();

    try {
      const artifact = await importPdf(client);
      const result = await client.callTool({
        name: "update_pdf_metadata",
        arguments: {
          artifactUri: artifact.uri,
          expectedRevision: 1,
          metadata: {
            title: "Consulting report",
            subject: "Operating model review",
          },
        },
      });

      expect(result.isError).not.toBe(true);
      expect(result.structuredContent).toMatchObject({
        artifact: { uri: artifact.uri, revision: 2 },
        pageCountBefore: 2,
        pageCountAfter: 2,
        metadata: {
          title: "Consulting report",
          author: "Original author",
          subject: "Operating model review",
        },
      });

      const inspected = await client.callTool({
        name: "inspect_pdf",
        arguments: { artifactUri: artifact.uri },
      });
      expect(inspected.structuredContent).toMatchObject({
        revision: 2,
        pageCount: 2,
        metadata: { title: "Consulting report", author: "Original author" },
      });
    } finally {
      await client.close();
      await handler.close();
    }
  });
});
