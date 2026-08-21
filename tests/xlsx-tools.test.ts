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
    { name: "xlsx-tools-test", version: "1.0.0" },
    { versionNegotiation: { mode: "auto" } },
  );
  await client.connect(transport);
  return { client, handler };
}

async function importBytes(client: Client, name: string, mimeType: string, bytes: Uint8Array) {
  return client.callTool({
    name: "import_artifact_inline",
    arguments: {
      name,
      mimeType,
      dataBase64: Buffer.from(bytes).toString("base64"),
    },
  });
}

describe("managed XLSX artifact MCP tools", () => {
  it("exposes create, inspect, and patch tools with accurate annotations", async () => {
    const { client, handler } = await connectedClient();
    try {
      const tools = await client.listTools();
      expect(tools.tools.find((tool) => tool.name === "create_managed_xlsx")?.annotations).toMatchObject({
        readOnlyHint: false,
        openWorldHint: false,
        destructiveHint: false,
      });
      expect(tools.tools.find((tool) => tool.name === "inspect_managed_xlsx")?.annotations).toMatchObject({
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      });
      expect(tools.tools.find((tool) => tool.name === "patch_managed_xlsx")?.annotations).toMatchObject({
        readOnlyHint: false,
        openWorldHint: false,
        destructiveHint: true,
      });
    } finally {
      await client.close();
      await handler.close();
    }
  });

  it("creates and inspects a managed workbook with explicit formula cells", async () => {
    const { client, handler } = await connectedClient();
    try {
      const created = await client.callTool({
        name: "create_managed_xlsx",
        arguments: {
          name: "model.xlsx",
          workbook: {
            version: 1,
            worksheets: [{
              name: "Sheet1",
              rows: [[1], [2], ["=SUM(A1:A2)", { kind: "formula", formula: "=SUM(A1:A2)" }]],
            }],
          },
        },
      });
      expect(created.isError).not.toBe(true);
      const artifact = (created.structuredContent as { artifact: { uri: string; revision: number; mimeType: string } }).artifact;
      expect(artifact.revision).toBe(1);
      expect(artifact.mimeType).toBe("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

      const inspected = await client.callTool({
        name: "inspect_managed_xlsx",
        arguments: { artifactUri: artifact.uri },
      });
      expect(inspected.isError).not.toBe(true);
      expect(inspected.structuredContent).toMatchObject({
        artifact: { uri: artifact.uri, revision: 1 },
        managed: { managed: true, version: 1, sheetNames: ["Sheet1"], cellCount: 4 },
      });
    } finally {
      await client.close();
      await handler.close();
    }
  });

  it("patches only managed workbooks under the expected revision and revalidates formulas", async () => {
    const { client, handler } = await connectedClient();
    try {
      const created = await client.callTool({
        name: "create_managed_xlsx",
        arguments: {
          name: "plan.xlsx",
          workbook: { version: 1, worksheets: [{ name: "Inputs", rows: [[10, "literal"]] }] },
        },
      });
      const artifact = (created.structuredContent as { artifact: { uri: string } }).artifact;

      const patched = await client.callTool({
        name: "patch_managed_xlsx",
        arguments: {
          artifactUri: artifact.uri,
          expectedRevision: 1,
          mutations: [
            { type: "set-cell", sheetName: "Inputs", rowIndex: 0, columnIndex: 1, value: { kind: "formula", formula: "=A1+1" } },
            { type: "add-worksheet", name: "Output", rows: [[{ kind: "formula", formula: "=Inputs!B1*2" }]] },
          ],
        },
      });
      expect(patched.isError).not.toBe(true);
      expect(patched.structuredContent).toMatchObject({
        artifact: { revision: 2 },
        managed: { managed: true, sheetNames: ["Inputs", "Output"], cellCount: 3 },
        appliedMutationCount: 2,
      });

      const stale = await client.callTool({
        name: "patch_managed_xlsx",
        arguments: {
          artifactUri: artifact.uri,
          expectedRevision: 1,
          mutations: [{ type: "set-cell", sheetName: "Inputs", rowIndex: 0, columnIndex: 0, value: 5 }],
        },
      });
      expect(stale.isError).toBe(true);
      expect(stale.content).toEqual(expect.arrayContaining([
        expect.objectContaining({ type: "text", text: expect.stringMatching(/revision conflict/i) }),
      ]));

      const dangerous = await client.callTool({
        name: "patch_managed_xlsx",
        arguments: {
          artifactUri: artifact.uri,
          expectedRevision: 2,
          mutations: [{
            type: "set-cell",
            sheetName: "Inputs",
            rowIndex: 0,
            columnIndex: 1,
            value: { kind: "formula", formula: '=HYPERLINK("https://example.com","open")' },
          }],
        },
      });
      expect(dangerous.isError).toBe(true);
    } finally {
      await client.close();
      await handler.close();
    }
  });

  it("rejects arbitrary and macro-enabled XLSX packages from the managed mutation path", async () => {
    const { client, handler } = await connectedClient();
    try {
      const ordinary = zipSync({
        "[Content_Types].xml": strToU8(
          '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/></Types>',
        ),
        "xl/workbook.xml": strToU8("<workbook/>")
      });
      const importedOrdinary = await importBytes(
        client,
        "third-party.xlsx",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ordinary,
      );
      const ordinaryArtifact = (importedOrdinary.structuredContent as { artifact: { uri: string } }).artifact;
      const ordinaryPatch = await client.callTool({
        name: "patch_managed_xlsx",
        arguments: {
          artifactUri: ordinaryArtifact.uri,
          expectedRevision: 1,
          mutations: [{ type: "set-cell", sheetName: "Sheet1", rowIndex: 0, columnIndex: 0, value: "x" }],
        },
      });
      expect(ordinaryPatch.isError).toBe(true);
      expect(ordinaryPatch.content).toEqual(expect.arrayContaining([
        expect.objectContaining({ type: "text", text: expect.stringMatching(/not a Consulting Tools managed workbook/i) }),
      ]));

      const macro = zipSync({
        "[Content_Types].xml": strToU8(
          '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Override PartName="/xl/workbook.xml" ContentType="application/vnd.ms-excel.sheet.macroEnabled.main+xml"/></Types>',
        ),
        "docProps/custom.xml": strToU8("ConsultingToolsManagedWorkbook"),
      });
      const importedMacro = await importBytes(
        client,
        "macro.xlsm",
        "application/vnd.ms-excel.sheet.macroEnabled.12",
        macro,
      );
      const macroArtifact = (importedMacro.structuredContent as { artifact: { uri: string } }).artifact;
      const macroInspect = await client.callTool({
        name: "inspect_managed_xlsx",
        arguments: { artifactUri: macroArtifact.uri },
      });
      expect(macroInspect.isError).toBe(true);
      expect(macroInspect.content).toEqual(expect.arrayContaining([
        expect.objectContaining({ type: "text", text: expect.stringMatching(/macro-enabled/i) }),
      ]));
    } finally {
      await client.close();
      await handler.close();
    }
  });
});
