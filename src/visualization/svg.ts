export function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function formatSvgNumber(value: number): string {
  if (!Number.isFinite(value)) throw new Error("SVG numeric attributes must be finite.");
  const rounded = Math.round(value * 1_000) / 1_000;
  return Object.is(rounded, -0) ? "0" : String(rounded);
}

export function svgText(
  x: number,
  y: number,
  text: string,
  options: {
    anchor?: "start" | "middle" | "end";
    size?: number;
    weight?: number;
    fill?: string;
    rotate?: number | undefined;
    role?: string;
  } = {},
): string {
  const attrs = [
    `x="${formatSvgNumber(x)}"`,
    `y="${formatSvgNumber(y)}"`,
    `text-anchor="${options.anchor ?? "start"}"`,
    `font-family="Arial, Helvetica, sans-serif"`,
    `font-size="${formatSvgNumber(options.size ?? 15)}"`,
    `font-weight="${formatSvgNumber(options.weight ?? 400)}"`,
    `fill="${escapeXml(options.fill ?? "#222222")}"`,
  ];
  if (options.rotate !== undefined) {
    attrs.push(`transform="rotate(${formatSvgNumber(options.rotate)} ${formatSvgNumber(x)} ${formatSvgNumber(y)})"`);
  }
  if (options.role !== undefined) attrs.push(`data-role="${escapeXml(options.role)}"`);
  return `<text ${attrs.join(" ")}>${escapeXml(text)}</text>`;
}

export function assertSafeSvg(svg: string): void {
  const prohibitedElement = /<(?:script|foreignObject|a|image|use|style)\b/i;
  const prohibitedAttribute = /<[^>]+\s(?:on[a-z]+|href|xlink:href)\s*=/i;
  if (prohibitedElement.test(svg) || prohibitedAttribute.test(svg)) {
    throw new Error("Generated SVG contains a prohibited active or external construct.");
  }
}
