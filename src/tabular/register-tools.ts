import type { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import type { ArtifactMetadata, ArtifactStore } from "../artifacts/types.js";
import {
  type CsvDocument,
  type CsvSpreadsheetFormulaPolicy,
  parseCsv,
  serializeCsv,
} from "./csv.js";
import {
  deleteCsvColumn,
  deleteCsvRow,
  insertCsvColumn,
  insertCsvRow,
  setCsvCell,
  validateCsvShape,
} from "./csv-mutations.js";

const MAX_TOOL_ROWS = 10_000;
const MAX_TOOL_COLUMNS = 1_000;
const MAX_TOOL_CELL_CHARACTERS = 100_000;
const MAX_MUTATIONS = 1_000;
const MAX_PREVIEW_ROWS = 100;

const artifactMetadataSchema = z.object({
  id: z.string().uuid(),
  uri: z.string(),
  name: z.string(),
  mimeType: z.string(),
  byteSize: z.number().int().nonnegative(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  revision: z.number().int().positive(),
  createdAt: z.string(),
  modifiedAt: z.string(),
});

const csvCellSchema = z.string().max(MAX_TOOL_CELL_CHARACTERS);
const csvRowSchema = z.array(csvCellSchema).max(MAX_TOOL_COLUMNS);
const formulaPolicySchema = z.enum(["escape", "preserve"]);
const lineEndingSchema = z.enum(["crlf", "lf"]);
const artifactUriSchema = z.string().trim().min(1).max(512);

const csvShapeSchema = z.object({
  rowCount: z.number().int().nonnegative(),
  maxColumnCount: z.number().int().nonnegative(),
  uniformWidth: z.boolean(),
  widthByRow: z.array(z.number().int().nonnegative()),
});

const createCsvInputSchema = z.object({
  name: z.string().trim().min(1).max(255),
  rows: z.array(csvRowSchema).max(MAX_TOOL_ROWS),
  lineEnding: lineEndingSchema.optional(),
  terminalLineBreak: z.boolean().optional(),
  spreadsheetFormulaPolicy: formulaPolicySchema.optional(),
});

const inspectCsvInputSchema = z.object({
  artifactUri: artifactUriSchema,
  maxPreviewRows: z.number().int().min(1).max(MAX_PREVIEW_ROWS).optional(),
});

const setCellMutationSchema = z.object({
  type: z.literal("set-cell"),
  rowIndex: z.number().int().nonnegative(),
  columnIndex: z.number().int().nonnegative(),
  value: csvCellSchema,
});
const insertRowMutationSchema = z.object({
  type: z.literal("insert-row"),
  rowIndex: z.number().int().nonnegative(),
  values: csvRowSchema,
});
const deleteRowMutationSchema = z.object({
  type: z.literal("delete-row"),
  rowIndex: z.number().int().nonnegative(),
});
const insertColumnMutationSchema = z.object({
  type: z.literal("insert-column"),
  columnIndex: z.number().int().nonnegative(),
  values: z.array(csvCellSchema).max(MAX_TOOL_ROWS).optional(),
});
const deleteColumnMutationSchema = z.object({
  type: z.literal("delete-column"),
  columnIndex: z.number().int().nonnegative(),
});
const csvMutationSchema = z.discriminatedUnion("type", [
  setCellMutationSchema,
  insertRowMutationSchema,
  deleteRowMutationSchema,
  insertColumnMutationSchema,
  deleteColumnMutationSchema,
]);

const patchCsvInputSchema = z.object({
  artifactUri: artifactUriSchema,
  expectedRevision: z.number().int().positive(),
  mutations: z.array(csvMutationSchema).min(1).max(MAX_MUTATIONS),
  spreadsheetFormulaPolicy: formulaPolicySchema.optional(),
  lineEnding: lineEndingSchema.optional(),
  terminalLineBreak: z.boolean().optional(),
});

const createCsvOutputSchema = z.object({
  artifact: artifactMetadataSchema,
  shape: csvShapeSchema,
});
const inspectCsvOutputSchema = z.object({
  artifact: artifactMetadataSchema,
  shape: csvShapeSchema,
  previewRows: z.array(z.array(z.string())),
  previewTruncated: z.boolean(),
  spreadsheetFormulaRiskFieldCount: z.number().int().nonnegative(),
});
const patchCsvOutputSchema = z.object({
  artifact: artifactMetadataSchema,
  shape: csvShapeSchema,
  appliedMutationCount: z.number().int().positive(),
});

function artifactIdFromUri(value: string): string {
  let uri: URL;
  try {
    uri = new URL(value);
  } catch {
    throw new Error("artifactUri must be a valid artifact:// URI.");
  }
  if (
    uri.protocol !== "artifact:" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uri.hostname) ||
    uri.username !== "" ||
    uri.password !== "" ||
    uri.port !== "" ||
    (uri.pathname !== "" && uri.pathname !== "/") ||
    uri.search !== "" ||
    uri.hash !== ""
  ) {
    throw new Error("artifactUri must identify exactly one artifact:// UUID without credentials, port, query, or fragment.");
  }
  return uri.hostname.toLowerCase();
}

function assertExpectedRevision(actual: number, expected: number): void {
  if (actual !== expected) {
    throw new Error(`Artifact revision conflict: expected ${expected}, current revision is ${actual}. Re-inspect the artifact before retrying.`);
  }
}

function decodeUtf8(bytes: Buffer): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error("CSV artifact bytes must be valid UTF-8 text.");
  }
}

function resourceLink(metadata: ArtifactMetadata) {
  return {
    type: "resource_link" as const,
    uri: metadata.uri,
    name: metadata.name,
    mimeType: metadata.mimeType,
    description: `Artifact revision ${metadata.revision}; ${metadata.byteSize} bytes; sha256 ${metadata.sha256}`,
  };
}

function toolError(error: unknown) {
  return {
    isError: true as const,
    content: [{ type: "text" as const, text: error instanceof Error ? error.message : "CSV artifact operation failed." }],
  };
}

function formulaRiskFieldCount(document: CsvDocument): number {
  return document.rows.reduce(
    (sum, row) => sum + row.filter((value) => /^[=+\-@\t\0]/.test(value)).length,
    0,
  );
}

function applyMutations(
  source: CsvDocument,
  mutations: z.infer<typeof csvMutationSchema>[],
): CsvDocument {
  let document = source;
  for (const mutation of mutations) {
    switch (mutation.type) {
      case "set-cell":
        document = setCsvCell(document, mutation.rowIndex, mutation.columnIndex, mutation.value);
        break;
      case "insert-row":
        document = insertCsvRow(document, mutation.rowIndex, mutation.values);
        break;
      case "delete-row":
        document = deleteCsvRow(document, mutation.rowIndex);
        break;
      case "insert-column":
        document = insertCsvColumn(document, mutation.columnIndex, mutation.values);
        break;
      case "delete-column":
        document = deleteCsvColumn(document, mutation.columnIndex);
        break;
    }
  }
  return document;
}

function serializationOptions(
  document: CsvDocument,
  input: {
    spreadsheetFormulaPolicy?: CsvSpreadsheetFormulaPolicy | undefined;
    lineEnding?: "crlf" | "lf" | undefined;
    terminalLineBreak?: boolean | undefined;
  },
) {
  return {
    lineEnding: input.lineEnding ?? document.lineEnding,
    terminalLineBreak: input.terminalLineBreak ?? document.terminalLineBreak,
    spreadsheetFormulaPolicy: input.spreadsheetFormulaPolicy ?? "escape" as const,
  };
}

export function registerTabularTools(server: McpServer, artifactStore: ArtifactStore): void {
  server.registerTool(
    "create_csv_artifact",
    {
      title: "Create CSV artifact",
      description:
        "Create a bounded UTF-8 CSV artifact from explicit string rows. Spreadsheet formula-leading characters are escaped by default; use the explicit preserve policy only when unchanged formula-like text is required. No cell values are type-coerced.",
      inputSchema: createCsvInputSchema,
      outputSchema: createCsvOutputSchema,
      annotations: { readOnlyHint: false, openWorldHint: false, destructiveHint: false },
    },
    async ({ name, rows, lineEnding, terminalLineBreak, spreadsheetFormulaPolicy }) => {
      try {
        const logical: CsvDocument = {
          rows: rows.map((row) => [...row]),
          lineEnding: lineEnding ?? "crlf",
          terminalLineBreak: terminalLineBreak ?? false,
        };
        const text = serializeCsv(logical, {
          spreadsheetFormulaPolicy: spreadsheetFormulaPolicy ?? "escape",
        });
        const normalized = parseCsv(text);
        const artifact = await artifactStore.create({
          name,
          mimeType: "text/csv",
          bytes: Buffer.from(text, "utf8"),
        });
        const shape = validateCsvShape(normalized);
        return {
          structuredContent: { artifact, shape },
          content: [
            { type: "text", text: `Created ${shape.rowCount}-row CSV artifact ${artifact.uri} at revision ${artifact.revision}.` },
            resourceLink(artifact),
          ],
        };
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "inspect_csv_artifact",
    {
      title: "Inspect CSV artifact",
      description:
        "Parse a plugin-owned artifact as UTF-8 CSV and return shape plus a bounded row preview. Fields remain strings and formula-leading text is reported rather than executed.",
      inputSchema: inspectCsvInputSchema,
      outputSchema: inspectCsvOutputSchema,
      annotations: { readOnlyHint: true, openWorldHint: false, destructiveHint: false },
    },
    async ({ artifactUri, maxPreviewRows }) => {
      try {
        const snapshot = await artifactStore.read(artifactIdFromUri(artifactUri));
        const document = parseCsv(decodeUtf8(snapshot.bytes));
        const shape = validateCsvShape(document);
        const previewLimit = maxPreviewRows ?? 20;
        const previewRows = document.rows.slice(0, previewLimit).map((row) => [...row]);
        return {
          structuredContent: {
            artifact: snapshot.metadata,
            shape,
            previewRows,
            previewTruncated: document.rows.length > previewLimit,
            spreadsheetFormulaRiskFieldCount: formulaRiskFieldCount(document),
          },
          content: [
            { type: "text", text: `CSV has ${shape.rowCount} row(s) and up to ${shape.maxColumnCount} column(s); preview contains ${previewRows.length} row(s).` },
            resourceLink(snapshot.metadata),
          ],
        };
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "patch_csv_artifact",
    {
      title: "Patch CSV artifact",
      description:
        "Apply explicit bounded row/column/cell mutations to a plugin-owned UTF-8 CSV artifact under an expected-revision precondition and store the result as a new artifact revision. Spreadsheet formula-leading text is escaped by default.",
      inputSchema: patchCsvInputSchema,
      outputSchema: patchCsvOutputSchema,
      annotations: { readOnlyHint: false, openWorldHint: false, destructiveHint: true },
    },
    async ({
      artifactUri,
      expectedRevision,
      mutations,
      spreadsheetFormulaPolicy,
      lineEnding,
      terminalLineBreak,
    }) => {
      try {
        const id = artifactIdFromUri(artifactUri);
        const current = await artifactStore.read(id);
        assertExpectedRevision(current.metadata.revision, expectedRevision);
        const source = parseCsv(decodeUtf8(current.bytes));
        const updated = applyMutations(source, mutations);
        const text = serializeCsv(updated, serializationOptions(updated, {
          spreadsheetFormulaPolicy,
          lineEnding,
          terminalLineBreak,
        }));
        const normalized = parseCsv(text);
        const shape = validateCsvShape(normalized);
        const artifact = await artifactStore.replace(id, {
          bytes: Buffer.from(text, "utf8"),
          mimeType: "text/csv",
        });
        return {
          structuredContent: {
            artifact,
            shape,
            appliedMutationCount: mutations.length,
          },
          content: [
            { type: "text", text: `Applied ${mutations.length} CSV mutation(s); active artifact revision is ${artifact.revision}.` },
            resourceLink(artifact),
          ],
        };
      } catch (error) {
        return toolError(error);
      }
    },
  );
}
