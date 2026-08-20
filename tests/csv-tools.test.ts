import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { describe, expect, it } from "vitest";
import { createHttpHandler } from "../src/http.js";

async function connectedClient() {
  const handler = createHttpHandler();
  const transport = new StreamableHTTPClientTransport(new URL("http://test.local/mcp"), {
    fetch: (url, init) => handler.fetch(new Request(url, init)),
  });
  const client = new Client(
    { name: "csv-tools-test", version: "1.0.0" },
    { versionNegotiation: { mode: "auto" } },
  );
  await client.connect(transport);
  return { client, handler };
}

describe("CSV artifact MCP tools", () => {
  it("exposes bounded CSV tools with accurate annotations", async () => {
    const { client, handler } = await connectedClient();
    try {
      const tools = await client.listTools();
      expect(tools.tools.find((tool) => tool.name === "create_csv_artifact")?.annotations).toMatchObject({
        readOnlyHint: false,
        openWorldHint: false,
        destructiveHint: false,
      });
      expect(tools.tools.find((tool) => tool.name === "inspect_csv_artifact")?.annotations).toMatchObject({
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      });
      expect(tools.tools.find((tool) => tool.name === "patch_csv_artifact")?.annotations).toMatchObject({
        readOnlyHint: false,
        openWorldHint: false,
        destructiveHint: true,
      });
    } finally {
      await client.close();
      await handler.close();
    }
  });

  it("creates spreadsheet-safe CSV by default and inspects a bounded preview", async () => {
    const { client, handler } = await connectedClient();
    try {
      const created = await client.callTool({
        name: "create_csv_artifact",
        arguments: {
          name: "analysis.csv",
          rows: [["name", "formula"], ["alpha", "=1+1"]],
          lineEnding: "crlf",
          terminalLineBreak: true,
        },
      });
      expect(created.isError).not.toBe(true);
      const artifact = (created.structuredContent as { artifact: { uri: string; revision: number; mimeType: string } }).artifact;
      expect(artifact.mimeType).toBe("text/csv");
      expect(artifact.revision).toBe(1);

      const inspected = await client.callTool({
        name: "inspect_csv_artifact",
        arguments: { artifactUri: artifact.uri, maxPreviewRows: 10 },
      });
      expect(inspected.isError).not.toBe(true);
      expect(inspected.structuredContent).toMatchObject({
        shape: { rowCount: 2, maxColumnCount: 2, uniformWidth: true },
        previewRows: [["name", "formula"], ["alpha", "'=1+1"]],
        previewTruncated: false,
      });
    } finally {
      await client.close();
      await handler.close();
    }
  });

  it("patches explicit CSV cells under an expected-revision precondition", async () => {
    const { client, handler } = await connectedClient();
    try {
      const created = await client.callTool({
        name: "create_csv_artifact",
        arguments: { name: "data.csv", rows: [["a", "b"], ["1", "2"]] },
      });
      const artifact = (created.structuredContent as { artifact: { uri: string; revision: number } }).artifact;

      const patched = await client.callTool({
        name: "patch_csv_artifact",
        arguments: {
          artifactUri: artifact.uri,
          expectedRevision: 1,
          mutations: [
            { type: "set-cell", rowIndex: 1, columnIndex: 1, value: "=SUM(A1:A2)" },
            { type: "insert-row", rowIndex: 2, values: ["3", "4"] },
          ],
        },
      });
      expect(patched.isError).not.toBe(true);
      expect(patched.structuredContent).toMatchObject({
        artifact: { revision: 2 },
        shape: { rowCount: 3, maxColumnCount: 2 },
      });

      const inspected = await client.callTool({
        name: "inspect_csv_artifact",
        arguments: { artifactUri: artifact.uri, maxPreviewRows: 10 },
      });
      expect(inspected.structuredContent).toMatchObject({
        previewRows: [["a", "b"], ["1", "'=SUM(A1:A2)"], ["3", "4"]],
      });

      const stale = await client.callTool({
        name: "patch_csv_artifact",
        arguments: {
          artifactUri: artifact.uri,
          expectedRevision: 1,
          mutations: [{ type: "set-cell", rowIndex: 0, columnIndex: 0, value: "stale" }],
        },
      });
      expect(stale.isError).toBe(true);
      expect(stale.content).toEqual(expect.arrayContaining([
        expect.objectContaining({ type: "text", text: expect.stringMatching(/revision conflict/i) }),
      ]));
    } finally {
      await client.close();
      await handler.close();
    }
  });

  it("supports an explicit preserve policy without changing the parsed string contract", async () => {
    const { client, handler } = await connectedClient();
    try {
      const created = await client.callTool({
        name: "create_csv_artifact",
        arguments: {
          name: "raw.csv",
          rows: [["=1+1"]],
          spreadsheetFormulaPolicy: "preserve",
        },
      });
      const artifact = (created.structuredContent as { artifact: { uri: string } }).artifact;
      const inspected = await client.callTool({
        name: "inspect_csv_artifact",
        arguments: { artifactUri: artifact.uri },
      });
      expect(inspected.structuredContent).toMatchObject({ previewRows: [["=1+1"]] });
    } finally {
      await client.close();
      await handler.close();
    }
  });
});
