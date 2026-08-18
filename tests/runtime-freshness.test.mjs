import { describe, expect, it } from "vitest";
import {
  findStalePins,
  highestStableVersion,
  parseNpmJson,
} from "../scripts/check-runtime-freshness.mjs";

describe("runtime dependency freshness", () => {
  it("parses npm JSON output without assuming scalar output", () => {
    expect(parseNpmJson('"2.0.0"')).toBe("2.0.0");
    expect(parseNpmJson('["24.12.0","24.13.3","24.13.2"]')).toEqual([
      "24.12.0",
      "24.13.3",
      "24.13.2",
    ]);
  });

  it("selects the highest stable semantic version from a version line", () => {
    expect(highestStableVersion(["24.12.0", "24.13.3", "24.13.2", "25.0.0-beta.1"])).toBe(
      "24.13.3",
    );
  });

  it("reports only pins that differ from their verified registry targets", () => {
    const packageJson = {
      dependencies: {
        "@modelcontextprotocol/server": "2.0.0",
        docx: "9.7.1",
        fflate: "0.8.3",
        zod: "4.4.3",
      },
      devDependencies: {
        "@modelcontextprotocol/client": "2.0.0",
        "@types/node": "24.13.3",
        typescript: "7.0.2",
        vitest: "4.1.10",
      },
    };

    const latest = {
      "@modelcontextprotocol/server": "2.0.0",
      "@modelcontextprotocol/client": "2.0.0",
      docx: "9.7.1",
      fflate: "0.8.3",
      zod: "4.4.3",
      "@types/node": "24.13.4",
      typescript: "7.0.2",
      vitest: "4.1.10",
    };

    expect(findStalePins(packageJson, latest)).toEqual([
      {
        name: "@types/node",
        pinned: "24.13.3",
        current: "24.13.4",
      },
    ]);
  });
});
