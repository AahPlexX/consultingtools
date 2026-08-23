import type { ExhibitSpecV1 } from "./types.js";

function parseHex(value: string, label: string): [number, number, number] {
  const normalized = value.startsWith("#") ? value.slice(1) : value;
  if (!/^[0-9A-Fa-f]{6}$/.test(normalized)) throw new Error(`${label} must be exactly six hexadecimal digits.`);
  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ];
}

function channelLuminance(channel: number): number {
  const normalized = channel / 255;
  return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
  const [red, green, blue] = parseHex(hex, "Color");
  return 0.2126 * channelLuminance(red) + 0.7152 * channelLuminance(green) + 0.0722 * channelLuminance(blue);
}

export function contrastRatio(foregroundHex: string, backgroundHex: string): number {
  const first = relativeLuminance(foregroundHex);
  const second = relativeLuminance(backgroundHex);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
}

export function validateExhibitAccessibility(spec: ExhibitSpecV1): { findings: string[] } {
  const findings: string[] = [];
  if (typeof spec.altText !== "string" || spec.altText.trim().length === 0) {
    findings.push("Exhibit alt text must provide a non-empty accessible description.");
  }
  if (spec.accentColorHex !== undefined) {
    try {
      if (contrastRatio(spec.accentColorHex, "FFFFFF") < 3) {
        findings.push("Exhibit accent color has insufficient contrast against the default white background for essential non-text graphics.");
      }
    } catch {
      findings.push("Exhibit accent color must be a valid six-digit hexadecimal color before contrast can be evaluated.");
    }
  }
  if (spec.kind === "line" && spec.series.length > 1) {
    findings.push("Multi-series line rendering requires a secondary non-color cue such as line style, markers, or direct labels.");
  }
  return { findings };
}
