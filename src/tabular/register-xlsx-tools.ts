import type { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import type { ArtifactMetadata, ArtifactStore } from "../artifacts/types.js";
import { createManagedXlsx, inspectManagedXlsx } from "./xlsx-managed.js";
import { patchManagedXlsx } from "./xlsx-mutations.js";
import { MANAGED_XLSX_LIMITS } from "./xlsx-types.js";

const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

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

const formulaCellSchema = z.object({
  kind: z.literal("formula"),
  formula: z.string().min(2).max(MANAGED_XLSX_LIMITS.maxFormulaCharacters),
}).strict();
const cellSchema = z.union([
  z.string().max(MANAGED_XLSX_LIMITS.maxCellTextCharacters),
  z.number().finite(),
  z.boolean(),
  z.null(),
  formulaCellSchema,
]);
const rowSchema = z.array(cellSchema).max(MANAGED_XLSX_LIMITS.maxColumnsPerWorksheet);
const worksheetSchema = z.object({
  name: z.string().min(1).max(31),
  rows: z.array(rowSchema).max(MANAGED_XLSX_LIMITS.maxRowsPerWorksheet),
}).strict();
const workbookSchema = z.object({
  version: z.literal(1),
  worksheets: z.array(worksheetSchema).min(1).max(MANAGED_XLSX_LIMITS.maxWorksheets),
}).strict();

const setCellMutationSchema = z.object({
  type: z.literal("set-cell"),
  sheetName: z.string().min(1).max(31),
  rowIndex: z.number().int().nonnegative(),
  columnIndex: z.number().int().nonnegative(),
  value: cellSchema,
}).strict();
const insertRowMutationSchema = z.object({
  type: z.literal("insert-row"),
  sheetName: z.string().min(1).max(31),
  rowIndex: z.number().int().nonnegative(),
  values: rowSchema.optional(),
}).strict();
const deleteRowMutationSchema = z.object({
  type: z.literal("delete-row"),
  sheetName: z.string().min(1).max(31),
  rowIndex: z.number().int().nonnegative(),
}).strict();
const insertColumnMutationSchema = z.object({
  type: z.literal("insert-column"),
  sheetName: z.string().min(1).max(31),
  columnIndex: z.number().int().nonnegative(),
  values: z.array(cellSchema).max(MANAGED_XLSX_LIMITS.maxRowsPerWorksheet).optional(),
}).strict();
const deleteColumnMutationSchema = z.object({
  type: z.literal("delete-column"),
  sheetName: z.string().min(1).max(31),
  columnIndex: z.number().int().nonnegative(),
}).strict();
const addWorksheetMutationSchema = z.object({
  type: z.literal("add-worksheet"),
  name: z.string().min(1).max(31),
  index: z.number().int().nonnegative().optional(),
  rows: z.array(rowSchema).max(MANAGED_XLSX_LIMITS.maxRowsPerWorksheet).optional(),
}).strict();
const deleteWorksheetMutationSchema = z.object({
  type: z.literal("delete-worksheet"),
  sheetName: z.string().min(1).max(31),
}).strict();
const renameWorksheetMutationSchema = z.object({
  type: z.literal("rename-worksheet"),
  sheetName: z.string().min(1).max(31),
  newName: z.string().min(1).max(31),
}).strict();
const mutationSchema = z.discriminatedUnion("type", [
  setCellMutationSchema,
  insertRowMutationSchema,
  deleteRowMutationSchema,
  insertColumnMutationSchema,
  deleteColumnMutationSchema,
  addWorksheetMutationSchema,
  deleteWorksheetMutationSchema,
  renameWorksheetMutationSchema,
]);

const managedInspectionSchema = z.object({
  managed: z.boolean(),
  version: z.number().int().nullable(),
  sheetNames: z.array(z.string()),
  cellCount: z.number().int().nonnegative(),
});
const createOutputSchema = z.object({ artifact: artifactMetadataSchema, managed: managedInspectionSchema });
const inspectOutputSchema = createOutputSchema;
const patchOutputSchema = z.object({
  artifact: artifactMetadataSchema,
  managed: managedInspectionSchema,
  appliedMutationCount: z.number().int().positive(),
});

function artifactIdFromUri(value: string): string {
  let uri: URL;
  try { uri = new URL(value); } catch { throw new Error("artifactUri must be a valid artifact:// URI."); }
  if (
    uri.protocol !== "artifact:" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uri.hostname) ||
    uri.username !== "" || uri.password !== "" || uri.port !== "" ||
    (uri.pathname !== "" && uri.pathname !== "/") || uri.search !== "" || uri.hash !== ""
  ) throw new Error("artifactUri must identify exactly one artifact:// UUID without credentials, port, query, or fragment.");
  return uri.hostname.toLowerCase();
}

function assertExpectedRevision(actual: number, expected: number): void {
  if (actual !== expected) {
    throw new Error(`Artifact revision conflict: expected ${expected}, current revision is ${actual}. Re-inspect the artifact before retrying.`);
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
    content: [{ type: "text" as const, text: error instanceof Error ? error.message : "Managed XLSX operation failed." }],
  };
}

export function registerManagedXlsxTools(server: McpServer, artifactStore: ArtifactStore): void {
  server.registerTool(
    "create_managed_xlsx",
    {
      title: "Create managed XLSX workbook",
      description: "Create a bounded macro-free Consulting Tools managed XLSX v1 workbook. Ordinary strings remain literal; formulas require the explicit formula-cell type and constrained allowlist. This does not import or preserve arbitrary third-party workbook features.",
      inputSchema: z.object({
        name: z.string().trim().min(1).max(255),
        workbook: workbookSchema,
      }),
      outputSchema: createOutputSchema,
      annotations: { readOnlyHint: false, openWorldHint: false, destructiveHint: false },
    },
    async ({ name, workbook }) => {
      try {
        const bytes = createManagedXlsx(workbook);
        const artifact = await artifactStore.create({ name, mimeType: XLSX_MIME, bytes });
        const managed = inspectManagedXlsx(bytes);
        return {
          structuredContent: { artifact, managed },
          content: [
            { type: "text", text: `Created managed XLSX ${artifact.uri} with ${managed.sheetNames.length} worksheet(s) at revision ${artifact.revision}.` },
            resourceLink(artifact),
          ],
        };
      } catch (error) { return toolError(error); }
    },
  );

  server.registerTool(
    "inspect_managed_xlsx",
    {
      title: "Inspect managed XLSX workbook",
      description: "Inspect whether a plugin-owned artifact is inside the exact Consulting Tools managed XLSX v1 envelope and return bounded structural metadata. Macro-enabled packages are rejected; arbitrary ordinary XLSX files are never treated as editable managed workbooks.",
      inputSchema: z.object({ artifactUri: z.string().trim().min(1).max(512) }),
      outputSchema: inspectOutputSchema,
      annotations: { readOnlyHint: true, openWorldHint: false, destructiveHint: false },
    },
    async ({ artifactUri }) => {
      try {
        const snapshot = await artifactStore.read(artifactIdFromUri(artifactUri));
        const managed = inspectManagedXlsx(snapshot.bytes);
        return {
          structuredContent: { artifact: snapshot.metadata, managed },
          content: [
            { type: "text", text: managed.managed ? `Managed XLSX v${managed.version} has ${managed.sheetNames.length} worksheet(s) and ${managed.cellCount} logical cell(s).` : "Artifact is not a Consulting Tools managed XLSX workbook." },
            resourceLink(snapshot.metadata),
          ],
        };
      } catch (error) { return toolError(error); }
    },
  );

  server.registerTool(
    "patch_managed_xlsx",
    {
      title: "Patch managed XLSX workbook",
      description: "Apply explicit bounded logical mutations to a Consulting Tools managed XLSX v1 workbook under an expected-revision precondition, then regenerate and revalidate the exact managed package. Arbitrary third-party XLSX and macro-enabled workbooks are rejected.",
      inputSchema: z.object({
        artifactUri: z.string().trim().min(1).max(512),
        expectedRevision: z.number().int().positive(),
        mutations: z.array(mutationSchema).min(1).max(MANAGED_XLSX_LIMITS.maxMutations),
      }),
      outputSchema: patchOutputSchema,
      annotations: { readOnlyHint: false, openWorldHint: false, destructiveHint: true },
    },
    async ({ artifactUri, expectedRevision, mutations }) => {
      try {
        const id = artifactIdFromUri(artifactUri);
        const current = await artifactStore.read(id);
        assertExpectedRevision(current.metadata.revision, expectedRevision);
        const bytes = patchManagedXlsx(current.bytes, mutations);
        const managed = inspectManagedXlsx(bytes);
        if (!managed.managed) throw new Error("Patched output failed the Consulting Tools managed XLSX validation boundary.");
        const artifact = await artifactStore.replace(id, { bytes, mimeType: XLSX_MIME });
        return {
          structuredContent: { artifact, managed, appliedMutationCount: mutations.length },
          content: [
            { type: "text", text: `Applied ${mutations.length} managed XLSX mutation(s); active artifact revision is ${artifact.revision}.` },
            resourceLink(artifact),
          ],
        };
      } catch (error) { return toolError(error); }
    },
  );
}
