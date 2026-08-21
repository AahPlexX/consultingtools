import { MANAGED_XLSX_LIMITS } from "./xlsx-types.js";

const MAX_FORMULA_CHARACTERS = 8_192;
const MAX_FUNCTION_ARGUMENTS = 255;
const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/;
const ALLOWED_FUNCTIONS = new Set([
  "SUM",
  "AVERAGE",
  "MIN",
  "MAX",
  "COUNT",
  "IF",
  "AND",
  "OR",
  "ROUND",
]);

type TokenKind =
  | "number"
  | "string"
  | "boolean"
  | "reference"
  | "identifier"
  | "operator"
  | "lparen"
  | "rparen"
  | "comma"
  | "colon"
  | "eof";

interface Token {
  kind: TokenKind;
  raw: string;
  sheetName?: string;
}

export interface ManagedFormulaValidationOptions {
  sheetNames?: readonly string[];
}

export interface ManagedFormulaValidationResult {
  normalized: string;
  references: string[];
}

function columnIndexFromLetters(letters: string): number {
  let value = 0;
  for (const character of letters.toUpperCase()) value = value * 26 + character.charCodeAt(0) - 64;
  return value - 1;
}

function validateCellReference(raw: string): void {
  const match = /^\$?([A-Za-z]+)\$?([1-9][0-9]*)$/.exec(raw);
  if (!match) throw new Error(`Invalid managed XLSX cell reference: ${raw}.`);
  const column = columnIndexFromLetters(match[1]!);
  const row = Number(match[2]);
  if (column < 0 || column >= MANAGED_XLSX_LIMITS.maxColumnsPerWorksheet) {
    throw new Error(`Managed XLSX formula reference ${raw} exceeds the managed column limit.`);
  }
  if (!Number.isSafeInteger(row) || row < 1 || row > MANAGED_XLSX_LIMITS.maxRowsPerWorksheet) {
    throw new Error(`Managed XLSX formula reference ${raw} exceeds the managed row limit.`);
  }
}

function parseCellReferenceAt(source: string, start: number): { raw: string; end: number } | undefined {
  const match = /^\$?[A-Za-z]+\$?[1-9][0-9]*/.exec(source.slice(start));
  if (!match) return undefined;
  const raw = match[0];
  const end = start + raw.length;
  const next = source[end];
  if (next !== undefined && /[A-Za-z0-9_.]/.test(next)) return undefined;
  validateCellReference(raw);
  return { raw, end };
}

function parseQuotedSheetReference(source: string, start: number): { token: Token; end: number } {
  let index = start + 1;
  let sheetName = "";
  let closed = false;
  while (index < source.length) {
    const character = source[index]!;
    if (character === "'") {
      if (source[index + 1] === "'") {
        sheetName += "'";
        index += 2;
        continue;
      }
      closed = true;
      index += 1;
      break;
    }
    sheetName += character;
    index += 1;
  }
  if (!closed || source[index] !== "!") {
    throw new Error("Quoted worksheet references must end with '!'.");
  }
  index += 1;
  const reference = parseCellReferenceAt(source, index);
  if (!reference) throw new Error("Worksheet reference must be followed by an A1 cell reference.");
  const raw = source.slice(start, reference.end);
  return { token: { kind: "reference", raw, sheetName }, end: reference.end };
}

function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  while (index < source.length) {
    const character = source[index]!;
    if (/\s/.test(character)) {
      index += 1;
      continue;
    }

    if (character === "'") {
      const parsed = parseQuotedSheetReference(source, index);
      tokens.push(parsed.token);
      index = parsed.end;
      continue;
    }

    if (character === '"') {
      const start = index;
      index += 1;
      let closed = false;
      while (index < source.length) {
        if (source[index] === '"') {
          if (source[index + 1] === '"') {
            index += 2;
            continue;
          }
          index += 1;
          closed = true;
          break;
        }
        index += 1;
      }
      if (!closed) throw new Error("Managed XLSX formula contains an unterminated string literal.");
      tokens.push({ kind: "string", raw: source.slice(start, index) });
      continue;
    }

    if (/[0-9.]/.test(character)) {
      const match = /^(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:[Ee][+-]?[0-9]+)?/.exec(source.slice(index));
      if (!match) throw new Error(`Invalid numeric token near ${source.slice(index, index + 12)}.`);
      tokens.push({ kind: "number", raw: match[0] });
      index += match[0].length;
      continue;
    }

    if (character === "$" || /[A-Za-z_]/.test(character)) {
      const reference = parseCellReferenceAt(source, index);
      if (reference) {
        tokens.push({ kind: "reference", raw: reference.raw });
        index = reference.end;
        continue;
      }

      const identifierMatch = /^[A-Za-z_][A-Za-z0-9_.]*/.exec(source.slice(index));
      if (!identifierMatch) throw new Error(`Invalid managed XLSX formula token near ${source.slice(index, index + 12)}.`);
      const raw = identifierMatch[0];
      const identifierEnd = index + raw.length;
      if (source[identifierEnd] === "!") {
        const cell = parseCellReferenceAt(source, identifierEnd + 1);
        if (!cell) throw new Error("Worksheet reference must be followed by an A1 cell reference.");
        tokens.push({
          kind: "reference",
          raw: source.slice(index, cell.end),
          sheetName: raw,
        });
        index = cell.end;
        continue;
      }
      const upper = raw.toUpperCase();
      if (upper === "TRUE" || upper === "FALSE") {
        tokens.push({ kind: "boolean", raw });
      } else {
        tokens.push({ kind: "identifier", raw });
      }
      index = identifierEnd;
      continue;
    }

    const twoCharacter = source.slice(index, index + 2);
    if (twoCharacter === "<=" || twoCharacter === ">=" || twoCharacter === "<>") {
      tokens.push({ kind: "operator", raw: twoCharacter });
      index += 2;
      continue;
    }
    if ("+-*/^&=<>".includes(character)) {
      tokens.push({ kind: "operator", raw: character });
      index += 1;
      continue;
    }
    if (character === "(") tokens.push({ kind: "lparen", raw: character });
    else if (character === ")") tokens.push({ kind: "rparen", raw: character });
    else if (character === ",") tokens.push({ kind: "comma", raw: character });
    else if (character === ":") tokens.push({ kind: "colon", raw: character });
    else throw new Error(`Unsupported managed XLSX formula token: ${character}.`);
    index += 1;
  }

  tokens.push({ kind: "eof", raw: "" });
  return tokens;
}

class Parser {
  private index = 0;
  readonly references: string[] = [];
  private readonly knownSheets: Set<string> | undefined;

  constructor(
    private readonly tokens: readonly Token[],
    sheetNames: readonly string[] | undefined,
  ) {
    this.knownSheets = sheetNames === undefined
      ? undefined
      : new Set(sheetNames.map((name) => name.toLocaleLowerCase("en-US")));
  }

  parse(): void {
    this.parseComparison();
    this.expect("eof");
  }

  private current(): Token {
    return this.tokens[this.index]!;
  }

  private consume(): Token {
    return this.tokens[this.index++]!;
  }

  private expect(kind: TokenKind, raw?: string): Token {
    const token = this.current();
    if (token.kind !== kind || (raw !== undefined && token.raw !== raw)) {
      throw new Error(`Malformed managed XLSX formula near token ${token.raw || "<end>"}.`);
    }
    return this.consume();
  }

  private matchOperator(...operators: string[]): boolean {
    const token = this.current();
    if (token.kind === "operator" && operators.includes(token.raw)) {
      this.consume();
      return true;
    }
    return false;
  }

  private parseComparison(): void {
    this.parseConcatenation();
    while (this.matchOperator("=", "<>", "<", ">", "<=", ">=")) this.parseConcatenation();
  }

  private parseConcatenation(): void {
    this.parseAdditive();
    while (this.matchOperator("&")) this.parseAdditive();
  }

  private parseAdditive(): void {
    this.parseMultiplicative();
    while (this.matchOperator("+", "-")) this.parseMultiplicative();
  }

  private parseMultiplicative(): void {
    this.parsePower();
    while (this.matchOperator("*", "/")) this.parsePower();
  }

  private parsePower(): void {
    this.parseUnary();
    if (this.matchOperator("^")) this.parsePower();
  }

  private parseUnary(): void {
    if (this.matchOperator("+", "-")) {
      this.parseUnary();
      return;
    }
    this.parsePrimary();
  }

  private parsePrimary(): void {
    const token = this.current();
    if (token.kind === "number" || token.kind === "string" || token.kind === "boolean") {
      this.consume();
      return;
    }
    if (token.kind === "reference") {
      const left = this.consume();
      this.assertSheetReference(left);
      if (this.current().kind === "colon") {
        this.consume();
        const right = this.expect("reference");
        this.assertSheetReference(right);
        if (right.sheetName !== undefined && left.sheetName !== undefined &&
            right.sheetName.toLocaleLowerCase("en-US") !== left.sheetName.toLocaleLowerCase("en-US")) {
          throw new Error("Managed XLSX formula ranges cannot span different worksheets.");
        }
        this.references.push(`${left.raw}:${right.raw}`);
      } else {
        this.references.push(left.raw);
      }
      return;
    }
    if (token.kind === "identifier") {
      this.parseFunctionCall();
      return;
    }
    if (token.kind === "lparen") {
      this.consume();
      this.parseComparison();
      this.expect("rparen");
      return;
    }
    throw new Error(`Malformed managed XLSX formula near token ${token.raw || "<end>"}.`);
  }

  private parseFunctionCall(): void {
    const identifier = this.expect("identifier").raw.toUpperCase();
    if (!ALLOWED_FUNCTIONS.has(identifier)) {
      throw new Error(`Managed XLSX function ${identifier} is not in the formula allowlist.`);
    }
    this.expect("lparen");
    let argumentCount = 0;
    if (this.current().kind !== "rparen") {
      while (true) {
        this.parseComparison();
        argumentCount += 1;
        if (argumentCount > MAX_FUNCTION_ARGUMENTS) throw new Error("Managed XLSX formula has too many function arguments.");
        if (this.current().kind !== "comma") break;
        this.consume();
        if (this.current().kind === "comma" || this.current().kind === "rparen") {
          throw new Error("Managed XLSX formula contains an empty function argument.");
        }
      }
    }
    this.expect("rparen");
    this.assertFunctionArity(identifier, argumentCount);
  }

  private assertFunctionArity(identifier: string, count: number): void {
    if (identifier === "IF" && (count < 2 || count > 3)) {
      throw new Error("Managed XLSX IF requires two or three arguments.");
    }
    if (identifier === "ROUND" && count !== 2) {
      throw new Error("Managed XLSX ROUND requires exactly two arguments.");
    }
    if (["SUM", "AVERAGE", "MIN", "MAX", "COUNT", "AND", "OR"].includes(identifier) && count < 1) {
      throw new Error(`Managed XLSX ${identifier} requires at least one argument.`);
    }
  }

  private assertSheetReference(token: Token): void {
    if (token.sheetName === undefined) return;
    if (this.knownSheets === undefined) {
      throw new Error("Managed XLSX worksheet references require the current workbook sheet list for validation.");
    }
    if (!this.knownSheets.has(token.sheetName.toLocaleLowerCase("en-US"))) {
      throw new Error(`Referenced sheet ${token.sheetName} is not present in the managed workbook.`);
    }
  }
}

export function validateManagedFormula(
  formula: string,
  options: ManagedFormulaValidationOptions = {},
): ManagedFormulaValidationResult {
  if (CONTROL_CHARACTERS.test(formula)) throw new Error("Managed XLSX formulas cannot contain control characters.");
  if (formula.length > MAX_FORMULA_CHARACTERS) {
    throw new Error(`Managed XLSX formula length exceeds ${MAX_FORMULA_CHARACTERS} characters.`);
  }
  if (!formula.startsWith("=")) throw new Error("Managed XLSX formulas must begin with =.");
  if (formula.length === 1) throw new Error("Managed XLSX formula cannot be empty.");

  const expression = formula.slice(1);
  if (expression.includes("[") || expression.includes("]")) {
    throw new Error("Managed XLSX formulas cannot contain external-workbook references.");
  }
  if (/\b(?:https?|ftp):\/\//i.test(expression) || expression.includes("\\") || expression.includes("|")) {
    throw new Error("Managed XLSX formulas cannot contain URL, file-path, or DDE-style external references.");
  }

  const parser = new Parser(tokenize(expression), options.sheetNames);
  parser.parse();
  return {
    normalized: formula,
    references: parser.references,
  };
}
