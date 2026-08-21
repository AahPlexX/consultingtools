import { strToU8, unzipSync, zipSync } from "fflate";
import { validateManagedFormula } from "./xlsx-formula.js";
import {
  MANAGED_XLSX_LIMITS,
  type ManagedCellValue,
  type ManagedFormulaCell,
  type ManagedWorkbook,
  type ManagedWorksheet,
  type ManagedXlsxInspection,
} from "./xlsx-types.js";

const SPREADSHEET_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
const RELATIONSHIP_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const PACKAGE_RELATIONSHIP_NS = "http://schemas.openxmlformats.org/package/2006/relationships";
const CUSTOM_PROPERTIES_NS = "http://schemas.openxmlformats.org/officeDocument/2006/custom-properties";
const VT_NS = "http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes";
const MANAGED_PROPERTY_NAME = "ConsultingToolsManagedWorkbook";
const MANAGED_PROPERTY_VERSION = 1;
const XLSX_MAIN_CONTENT_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml";
const WORKSHEET_CONTENT_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml";
const CUSTOM_PROPERTIES_CONTENT_TYPE = "application/vnd.openxmlformats-officedocument.custom-properties+xml";
const WORKSHEET_REL_TYPE = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet";
const OFFICE_DOCUMENT_REL_TYPE = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument";
const CUSTOM_PROPERTIES_REL_TYPE = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/custom-properties";
const XML_HEADER = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
const FORBIDDEN_SHEET_NAME = /[\\/:?*\[\]]/;
const INVALID_XML_CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/;

interface ParsedManagedPackage {
  workbook: ManagedWorkbook;
  files: Record<string, Uint8Array>;
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function decodeXml(value: string): string {
  if (/&(?!(?:amp|lt|gt|quot|apos);)/.test(value)) {
    throw new Error("Managed XLSX contains an unsupported XML entity.");
  }
  return value
    .replaceAll("&apos;", "'")
    .replaceAll("&quot;", '"')
    .replaceAll("&gt;", ">")
    .replaceAll("&lt;", "<")
    .replaceAll("&amp;", "&");
}

function decodeUtf8(bytes: Uint8Array, partName: string): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error(`Managed XLSX part ${partName} must be valid UTF-8 XML.`);
  }
}

function assertSafeXml(xml: string, partName: string): void {
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) {
    throw new Error(`Managed XLSX part ${partName} contains prohibited XML declarations.`);
  }
  if (INVALID_XML_CONTROL.test(xml)) {
    throw new Error(`Managed XLSX part ${partName} contains invalid XML control characters.`);
  }
}

function xmlPart(files: Record<string, Uint8Array>, name: string): string {
  const bytes = files[name];
  if (!bytes) throw new Error(`Managed XLSX is missing required part ${name}.`);
  const xml = decodeUtf8(bytes, name);
  assertSafeXml(xml, name);
  return xml;
}

function readAttribute(source: string, name: string): string | undefined {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`(?:^|\\s)${escapedName}="([^"]*)"`).exec(source);
  return match?.[1];
}

function assertWorksheetName(name: string): void {
  if (name.length < 1 || name.length > 31 || FORBIDDEN_SHEET_NAME.test(name) || INVALID_XML_CONTROL.test(name)) {
    throw new Error("Worksheet name must be 1-31 characters and must not contain \\ / : ? * [ ] or XML control characters.");
  }
}

function isManagedFormulaCell(value: unknown): value is ManagedFormulaCell {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  return keys.length === 2 && keys[0] === "formula" && keys[1] === "kind" && record.kind === "formula" && typeof record.formula === "string";
}

function assertWorkbook(workbook: ManagedWorkbook): void {
  if (workbook.version !== 1) throw new Error("Managed workbook version must be exactly 1.");
  if (workbook.worksheets.length < 1) throw new Error("Managed XLSX requires at least one worksheet.");
  if (workbook.worksheets.length > MANAGED_XLSX_LIMITS.maxWorksheets) {
    throw new Error(`Managed XLSX exceeds the ${MANAGED_XLSX_LIMITS.maxWorksheets}-worksheet limit.`);
  }

  const names = new Set<string>();
  for (const sheet of workbook.worksheets) {
    assertWorksheetName(sheet.name);
    const normalizedName = sheet.name.toLocaleLowerCase("en-US");
    if (names.has(normalizedName)) throw new Error("Worksheet names must be unique case-insensitively.");
    names.add(normalizedName);
  }
  const sheetNames = workbook.worksheets.map((sheet) => sheet.name);

  let logicalCells = 0;
  for (const sheet of workbook.worksheets) {
    if (sheet.rows.length > MANAGED_XLSX_LIMITS.maxRowsPerWorksheet) {
      throw new Error(`Worksheet ${sheet.name} exceeds the managed row limit.`);
    }
    for (const row of sheet.rows) {
      if (row.length > MANAGED_XLSX_LIMITS.maxColumnsPerWorksheet) {
        throw new Error(`Worksheet ${sheet.name} exceeds the managed column limit.`);
      }
      logicalCells += row.length;
      if (logicalCells > MANAGED_XLSX_LIMITS.maxLogicalCells) {
        throw new Error(`Managed XLSX exceeds the ${MANAGED_XLSX_LIMITS.maxLogicalCells}-logical-cell limit.`);
      }
      for (const value of row) {
        if (value === null || typeof value === "boolean") continue;
        if (typeof value === "number") {
          if (!Number.isFinite(value)) throw new Error("Managed XLSX numeric cells must be finite numbers.");
          continue;
        }
        if (typeof value === "string") {
          if (value.length > MANAGED_XLSX_LIMITS.maxCellTextCharacters) {
            throw new Error("Managed XLSX text cell exceeds the character limit.");
          }
          if (INVALID_XML_CONTROL.test(value)) {
            throw new Error("Managed XLSX text cells cannot contain XML control characters.");
          }
          continue;
        }
        if (!isManagedFormulaCell(value)) {
          throw new Error("Managed XLSX cells must be literal values or an explicit { kind: 'formula', formula } object.");
        }
        if (value.formula.length > MANAGED_XLSX_LIMITS.maxFormulaCharacters) {
          throw new Error("Managed XLSX formula cell exceeds the formula character limit.");
        }
        validateManagedFormula(value.formula, { sheetNames });
      }
    }
  }
}

function columnName(columnIndex: number): string {
  let value = columnIndex + 1;
  let result = "";
  while (value > 0) {
    const remainder = (value - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    value = Math.floor((value - 1) / 26);
  }
  return result;
}

function columnIndexFromName(name: string): number {
  if (!/^[A-Z]+$/.test(name)) throw new Error("Managed XLSX contains a malformed cell reference.");
  let value = 0;
  for (const character of name) value = value * 26 + (character.charCodeAt(0) - 64);
  const index = value - 1;
  if (index < 0 || index >= MANAGED_XLSX_LIMITS.maxColumnsPerWorksheet) {
    throw new Error("Managed XLSX cell reference exceeds the managed column limit.");
  }
  return index;
}

function cellXml(value: ManagedCellValue, rowNumber: number, columnIndex: number, sheetNames: readonly string[]): string {
  if (value === null) return "";
  const reference = `${columnName(columnIndex)}${rowNumber}`;
  if (typeof value === "string") {
    return `<c r="${reference}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
  }
  if (typeof value === "boolean") {
    return `<c r="${reference}" t="b"><v>${value ? "1" : "0"}</v></c>`;
  }
  if (typeof value === "number") {
    return `<c r="${reference}"><v>${String(value)}</v></c>`;
  }
  const validated = validateManagedFormula(value.formula, { sheetNames });
  return `<c r="${reference}"><f>${escapeXml(validated.normalized.slice(1))}</f></c>`;
}

function worksheetXml(sheet: ManagedWorksheet, sheetNames: readonly string[]): string {
  const rows = sheet.rows.map((row, rowIndex) => {
    const rowNumber = rowIndex + 1;
    const cells = row.map((value, columnIndex) => cellXml(value, rowNumber, columnIndex, sheetNames)).join("");
    const spans = row.length > 0 ? ` spans="1:${row.length}"` : "";
    return `<row r="${rowNumber}"${spans}>${cells}</row>`;
  }).join("");
  return `${XML_HEADER}<worksheet xmlns="${SPREADSHEET_NS}"><sheetData>${rows}</sheetData></worksheet>`;
}

function workbookXml(workbook: ManagedWorkbook): string {
  const sheets = workbook.worksheets.map((sheet, index) =>
    `<sheet name="${escapeXml(sheet.name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`,
  ).join("");
  return `${XML_HEADER}<workbook xmlns="${SPREADSHEET_NS}" xmlns:r="${RELATIONSHIP_NS}"><sheets>${sheets}</sheets><calcPr calcMode="auto" forceFullCalc="1" fullCalcOnLoad="1"/></workbook>`;
}

function workbookRelationshipsXml(sheetCount: number): string {
  const relationships = Array.from({ length: sheetCount }, (_, index) =>
    `<Relationship Id="rId${index + 1}" Type="${WORKSHEET_REL_TYPE}" Target="worksheets/sheet${index + 1}.xml"/>`,
  ).join("");
  return `${XML_HEADER}<Relationships xmlns="${PACKAGE_RELATIONSHIP_NS}">${relationships}</Relationships>`;
}

function rootRelationshipsXml(): string {
  return `${XML_HEADER}<Relationships xmlns="${PACKAGE_RELATIONSHIP_NS}"><Relationship Id="rId1" Type="${OFFICE_DOCUMENT_REL_TYPE}" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="${CUSTOM_PROPERTIES_REL_TYPE}" Target="docProps/custom.xml"/></Relationships>`;
}

function customPropertiesXml(): string {
  return `${XML_HEADER}<Properties xmlns="${CUSTOM_PROPERTIES_NS}" xmlns:vt="${VT_NS}"><property fmtid="{D5CDD505-2E9C-101B-9397-08002B2CF9AE}" pid="2" name="${MANAGED_PROPERTY_NAME}"><vt:i4>${MANAGED_PROPERTY_VERSION}</vt:i4></property></Properties>`;
}

function contentTypesXml(sheetCount: number): string {
  const worksheets = Array.from({ length: sheetCount }, (_, index) =>
    `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="${WORKSHEET_CONTENT_TYPE}"/>`,
  ).join("");
  return `${XML_HEADER}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="${XLSX_MAIN_CONTENT_TYPE}"/><Override PartName="/docProps/custom.xml" ContentType="${CUSTOM_PROPERTIES_CONTENT_TYPE}"/>${worksheets}</Types>`;
}

function expectedPartNames(sheetCount: number): string[] {
  return [
    "[Content_Types].xml",
    "_rels/.rels",
    "docProps/custom.xml",
    "xl/_rels/workbook.xml.rels",
    "xl/workbook.xml",
    ...Array.from({ length: sheetCount }, (_, index) => `xl/worksheets/sheet${index + 1}.xml`),
  ].sort();
}

function assertSafeZipEntryName(name: string): void {
  const segments = name.split("/");
  if (
    name.length === 0 ||
    name.startsWith("/") ||
    name.includes("\\") ||
    INVALID_XML_CONTROL.test(name) ||
    segments.some((segment) => segment === "" || segment === "." || segment === "..")
  ) {
    throw new Error(`Unsafe ZIP entry path: ${name || "<empty>"}.`);
  }
}

function safeUnzip(bytes: Uint8Array): Record<string, Uint8Array> {
  if (bytes.byteLength > MANAGED_XLSX_LIMITS.maxArchiveBytes) {
    throw new Error(`Managed XLSX archive exceeds the ${MANAGED_XLSX_LIMITS.maxArchiveBytes}-byte input limit.`);
  }
  const names = new Set<string>();
  let entryCount = 0;
  let expandedTotal = 0;
  let macroPartDetected = false;
  const files = unzipSync(bytes, {
    filter(file) {
      entryCount += 1;
      if (entryCount > MANAGED_XLSX_LIMITS.maxZipEntries) {
        throw new Error(`Managed XLSX exceeds the ${MANAGED_XLSX_LIMITS.maxZipEntries}-entry ZIP limit.`);
      }
      assertSafeZipEntryName(file.name);
      if (names.has(file.name)) throw new Error(`Managed XLSX contains duplicate ZIP entry ${file.name}.`);
      names.add(file.name);
      if (file.originalSize > MANAGED_XLSX_LIMITS.maxExpandedEntryBytes) {
        throw new Error(`Managed XLSX ZIP entry ${file.name} exceeds the expanded-size limit.`);
      }
      expandedTotal += file.originalSize;
      if (expandedTotal > MANAGED_XLSX_LIMITS.maxExpandedBytes) {
        throw new Error("Managed XLSX exceeds the total expanded-size limit.");
      }
      if (file.name.toLowerCase().endsWith("vbaproject.bin")) macroPartDetected = true;
      return true;
    },
  });
  if (macroPartDetected) throw new Error("Macro-enabled XLSX content is outside the managed workbook envelope.");
  return files;
}

function parseRelationships(xml: string): { id: string; type: string; target: string }[] {
  const relationships: { id: string; type: string; target: string }[] = [];
  const pattern = /<Relationship\b([^>]*)\/>/g;
  for (const match of xml.matchAll(pattern)) {
    const attributes = match[1] ?? "";
    const id = readAttribute(attributes, "Id");
    const type = readAttribute(attributes, "Type");
    const target = readAttribute(attributes, "Target");
    if (!id || !type || !target) throw new Error("Managed XLSX contains malformed relationship metadata.");
    relationships.push({ id, type, target });
  }
  return relationships;
}

function validateRootRelationships(xml: string): void {
  const relationships = parseRelationships(xml);
  const office = relationships.find((relationship) => relationship.type === OFFICE_DOCUMENT_REL_TYPE);
  const custom = relationships.find((relationship) => relationship.type === CUSTOM_PROPERTIES_REL_TYPE);
  if (!office || office.target !== "xl/workbook.xml" || !custom || custom.target !== "docProps/custom.xml") {
    throw new Error("Managed XLSX root relationships do not match the managed v1 envelope.");
  }
}

function parseSheetMetadata(xml: string): { name: string; sheetId: number; relationshipId: string }[] {
  const sheetsMatch = /<sheets>([\s\S]*?)<\/sheets>/.exec(xml);
  if (!sheetsMatch) throw new Error("Managed XLSX workbook is missing its sheets collection.");
  const sheets: { name: string; sheetId: number; relationshipId: string }[] = [];
  for (const match of sheetsMatch[1]!.matchAll(/<sheet\b([^>]*)\/>/g)) {
    const attributes = match[1] ?? "";
    const rawName = readAttribute(attributes, "name");
    const rawSheetId = readAttribute(attributes, "sheetId");
    const relationshipId = readAttribute(attributes, "r:id");
    if (rawName === undefined || rawSheetId === undefined || relationshipId === undefined) {
      throw new Error("Managed XLSX workbook contains malformed sheet metadata.");
    }
    const sheetId = Number(rawSheetId);
    if (!Number.isSafeInteger(sheetId) || sheetId < 1) throw new Error("Managed XLSX contains an invalid sheet ID.");
    const name = decodeXml(rawName);
    assertWorksheetName(name);
    sheets.push({ name, sheetId, relationshipId });
  }
  if (sheets.length < 1 || sheets.length > MANAGED_XLSX_LIMITS.maxWorksheets) {
    throw new Error("Managed XLSX workbook has an invalid worksheet count.");
  }
  const names = new Set<string>();
  const ids = new Set<number>();
  for (const [index, sheet] of sheets.entries()) {
    const normalized = sheet.name.toLocaleLowerCase("en-US");
    if (names.has(normalized)) throw new Error("Managed XLSX worksheet names must be unique case-insensitively.");
    if (ids.has(sheet.sheetId)) throw new Error("Managed XLSX contains duplicate sheet IDs.");
    names.add(normalized);
    ids.add(sheet.sheetId);
    if (sheet.sheetId !== index + 1 || sheet.relationshipId !== `rId${index + 1}`) {
      throw new Error("Managed XLSX sheet identifiers do not match the managed v1 sequence.");
    }
  }
  return sheets;
}

function validateWorkbookRelationships(xml: string, sheetCount: number): void {
  const relationships = parseRelationships(xml);
  if (relationships.length !== sheetCount) {
    throw new Error("Managed XLSX workbook relationship count does not match its worksheets.");
  }
  for (let index = 0; index < sheetCount; index += 1) {
    const relationship = relationships[index];
    if (
      !relationship ||
      relationship.id !== `rId${index + 1}` ||
      relationship.type !== WORKSHEET_REL_TYPE ||
      relationship.target !== `worksheets/sheet${index + 1}.xml`
    ) {
      throw new Error("Managed XLSX workbook relationships do not match the managed v1 envelope.");
    }
  }
}

function parseRowWidth(attributes: string): number {
  const rawSpans = readAttribute(attributes, "spans");
  if (rawSpans === undefined) return 0;
  const match = /^1:([1-9][0-9]*)$/.exec(rawSpans);
  if (!match) throw new Error("Managed XLSX row contains an invalid spans attribute.");
  const width = Number(match[1]);
  if (!Number.isSafeInteger(width) || width > MANAGED_XLSX_LIMITS.maxColumnsPerWorksheet) {
    throw new Error("Managed XLSX row exceeds the managed column limit.");
  }
  return width;
}

function parseCellBody(type: string | undefined, body: string, sheetNames: readonly string[]): ManagedCellValue {
  const formulaMatch = /^<f>([\s\S]*?)<\/f>$/.exec(body);
  if (formulaMatch) {
    if (type !== undefined) throw new Error("Managed XLSX formula cells cannot carry a literal cell type.");
    const formula = `=${decodeXml(formulaMatch[1] ?? "")}`;
    validateManagedFormula(formula, { sheetNames });
    return { kind: "formula", formula };
  }
  if (/<f\b/i.test(body)) throw new Error("Managed XLSX contains malformed or cached formula cell content.");
  if (type === "inlineStr") {
    const match = /^<is><t xml:space="preserve">([\s\S]*?)<\/t><\/is>$/.exec(body);
    if (!match) throw new Error("Managed XLSX contains malformed inline-string cell content.");
    const value = decodeXml(match[1] ?? "");
    if (value.length > MANAGED_XLSX_LIMITS.maxCellTextCharacters || INVALID_XML_CONTROL.test(value)) {
      throw new Error("Managed XLSX text cell exceeds the managed text envelope.");
    }
    return value;
  }
  const valueMatch = /^<v>([^<]*)<\/v>$/.exec(body);
  if (!valueMatch) throw new Error("Managed XLSX contains malformed scalar cell content.");
  const rawValue = valueMatch[1] ?? "";
  if (type === "b") {
    if (rawValue !== "0" && rawValue !== "1") throw new Error("Managed XLSX boolean cell must contain 0 or 1.");
    return rawValue === "1";
  }
  if (type !== undefined) throw new Error(`Managed XLSX contains unsupported cell type ${type}.`);
  if (!/^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[Ee][+-]?[0-9]+)?$/.test(rawValue)) {
    throw new Error("Managed XLSX numeric cell contains an invalid finite decimal value.");
  }
  const value = Number(rawValue);
  if (!Number.isFinite(value)) throw new Error("Managed XLSX numeric cells must be finite numbers.");
  return value;
}

function parseWorksheet(xml: string, expectedSheetIndex: number, sheetNames: readonly string[]): ManagedCellValue[][] {
  const sheetData = /<sheetData>([\s\S]*?)<\/sheetData>/.exec(xml);
  if (!sheetData) throw new Error("Managed XLSX worksheet is missing sheetData.");
  const rows: ManagedCellValue[][] = [];
  const rowPattern = /<row\b([^>]*?)(?:\/>|>([\s\S]*?)<\/row>)/g;
  for (const match of sheetData[1]!.matchAll(rowPattern)) {
    const attributes = match[1] ?? "";
    const rawRowNumber = readAttribute(attributes, "r");
    if (!rawRowNumber) throw new Error("Managed XLSX row is missing its row number.");
    const rowNumber = Number(rawRowNumber);
    if (!Number.isSafeInteger(rowNumber) || rowNumber !== rows.length + 1) {
      throw new Error("Managed XLSX row numbers must be sequential in managed v1.");
    }
    const width = parseRowWidth(attributes);
    const row: ManagedCellValue[] = Array.from({ length: width }, () => null);
    const body = match[2] ?? "";
    let previousColumn = -1;
    let encounteredCell = false;
    for (const cellMatch of body.matchAll(/<c\b([^>]*?)>([\s\S]*?)<\/c>/g)) {
      encounteredCell = true;
      const cellAttributes = cellMatch[1] ?? "";
      const reference = readAttribute(cellAttributes, "r");
      if (!reference) throw new Error("Managed XLSX cell is missing its reference.");
      const referenceMatch = /^([A-Z]+)([1-9][0-9]*)$/.exec(reference);
      if (!referenceMatch) throw new Error("Managed XLSX contains a malformed cell reference.");
      const cellRow = Number(referenceMatch[2]);
      if (cellRow !== rowNumber) throw new Error("Managed XLSX cell reference points to the wrong row.");
      const column = columnIndexFromName(referenceMatch[1]!);
      if (column <= previousColumn) throw new Error("Managed XLSX cell references must be strictly increasing within a row.");
      if (column >= width) throw new Error("Managed XLSX cell reference exceeds the row span.");
      previousColumn = column;
      row[column] = parseCellBody(readAttribute(cellAttributes, "t"), cellMatch[2] ?? "", sheetNames);
    }
    if (encounteredCell && width === 0) throw new Error("Managed XLSX row with cells must declare its logical span.");
    if (/<c\b[^>]*\/>/.test(body)) throw new Error("Managed XLSX v1 does not use empty cell elements.");
    rows.push(row);
    if (rows.length > MANAGED_XLSX_LIMITS.maxRowsPerWorksheet) {
      throw new Error(`Managed XLSX worksheet ${expectedSheetIndex} exceeds the managed row limit.`);
    }
  }
  return rows;
}

function hasManagedMarker(customXml: string | undefined): boolean {
  if (customXml === undefined) return false;
  assertSafeXml(customXml, "docProps/custom.xml");
  if (!customXml.includes(MANAGED_PROPERTY_NAME)) return false;
  const propertyPattern = new RegExp(
    `<property\\b[^>]*name="${MANAGED_PROPERTY_NAME}"[^>]*>[\\s\\S]*?<vt:i4>${MANAGED_PROPERTY_VERSION}<\\/vt:i4>[\\s\\S]*?<\\/property>`,
  );
  if (!propertyPattern.test(customXml)) {
    throw new Error("Consulting Tools managed-workbook marker is malformed or uses an unsupported version.");
  }
  return true;
}

function parseManagedPackage(bytes: Uint8Array): ParsedManagedPackage | undefined {
  const files = safeUnzip(bytes);
  const contentTypesBytes = files["[Content_Types].xml"];
  const contentTypes = contentTypesBytes ? decodeUtf8(contentTypesBytes, "[Content_Types].xml") : undefined;
  if (contentTypes !== undefined) {
    assertSafeXml(contentTypes, "[Content_Types].xml");
    if (/macroenabled/i.test(contentTypes)) {
      throw new Error("Macro-enabled XLSX content is outside the managed workbook envelope.");
    }
  }

  const customBytes = files["docProps/custom.xml"];
  const customXml = customBytes ? decodeUtf8(customBytes, "docProps/custom.xml") : undefined;
  if (!hasManagedMarker(customXml)) return undefined;
  if (!contentTypes || !contentTypes.includes(XLSX_MAIN_CONTENT_TYPE)) {
    throw new Error("Managed XLSX marker is present but the workbook content type is invalid.");
  }
  if (!contentTypes.includes(CUSTOM_PROPERTIES_CONTENT_TYPE)) {
    throw new Error("Managed XLSX marker is present but the custom-properties content type is missing.");
  }

  const rootRelationships = xmlPart(files, "_rels/.rels");
  const workbookPart = xmlPart(files, "xl/workbook.xml");
  const workbookRelationships = xmlPart(files, "xl/_rels/workbook.xml.rels");
  validateRootRelationships(rootRelationships);
  const sheets = parseSheetMetadata(workbookPart);
  validateWorkbookRelationships(workbookRelationships, sheets.length);

  const expected = expectedPartNames(sheets.length);
  const actual = Object.keys(files).sort();
  if (actual.length !== expected.length || actual.some((name, index) => name !== expected[index])) {
    throw new Error("Managed XLSX contains parts outside the exact managed v1 envelope.");
  }

  const sheetNames = sheets.map((sheet) => sheet.name);
  const worksheets: ManagedWorksheet[] = sheets.map((sheet, index) => {
    const path = `xl/worksheets/sheet${index + 1}.xml`;
    if (!contentTypes.includes(`PartName="/${path}"`) || !contentTypes.includes(WORKSHEET_CONTENT_TYPE)) {
      throw new Error(`Managed XLSX content types do not declare ${path}.`);
    }
    return {
      name: sheet.name,
      rows: parseWorksheet(xmlPart(files, path), index + 1, sheetNames),
    };
  });

  const workbook: ManagedWorkbook = { version: 1, worksheets };
  assertWorkbook(workbook);
  return { workbook, files };
}

export function createManagedXlsx(workbook: ManagedWorkbook): Buffer {
  assertWorkbook(workbook);
  const sheetNames = workbook.worksheets.map((sheet) => sheet.name);
  const parts: Record<string, Uint8Array> = {
    "[Content_Types].xml": strToU8(contentTypesXml(workbook.worksheets.length)),
    "_rels/.rels": strToU8(rootRelationshipsXml()),
    "docProps/custom.xml": strToU8(customPropertiesXml()),
    "xl/_rels/workbook.xml.rels": strToU8(workbookRelationshipsXml(workbook.worksheets.length)),
    "xl/workbook.xml": strToU8(workbookXml(workbook)),
  };
  workbook.worksheets.forEach((sheet, index) => {
    parts[`xl/worksheets/sheet${index + 1}.xml`] = strToU8(worksheetXml(sheet, sheetNames));
  });
  const bytes = Buffer.from(zipSync(parts));
  if (bytes.byteLength > MANAGED_XLSX_LIMITS.maxArchiveBytes) {
    throw new Error(`Managed XLSX archive exceeds the ${MANAGED_XLSX_LIMITS.maxArchiveBytes}-byte output limit.`);
  }
  return bytes;
}

export function inspectManagedXlsx(bytes: Uint8Array): ManagedXlsxInspection {
  const parsed = parseManagedPackage(bytes);
  if (!parsed) return { managed: false, version: null, sheetNames: [], cellCount: 0 };
  return {
    managed: true,
    version: parsed.workbook.version,
    sheetNames: parsed.workbook.worksheets.map((sheet) => sheet.name),
    cellCount: parsed.workbook.worksheets.reduce(
      (total, sheet) => total + sheet.rows.reduce((sheetTotal, row) => sheetTotal + row.length, 0),
      0,
    ),
  };
}

export function readManagedXlsx(bytes: Uint8Array): ManagedWorkbook {
  const parsed = parseManagedPackage(bytes);
  if (!parsed) throw new Error("Artifact is not a Consulting Tools managed workbook.");
  return parsed.workbook;
}
