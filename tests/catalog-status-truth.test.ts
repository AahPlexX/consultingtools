import { describe, expect, it } from "vitest";
import { getCapabilityById } from "../src/catalog.js";

describe("capability implementation truth", () => {
  it("keeps verified narrow implementations distinct from broader claims", () => {
    expect(getCapabilityById("break-even")?.status).toBe("implemented");
    expect(getCapabilityById("simple-roi")?.status).toBe("implemented");
    expect(getCapabilityById("roi")?.status).toBe("partial");
    expect(getCapabilityById("docx-template-patching")?.status).toBe("implemented");
    expect(getCapabilityById("pdf-metadata-update")?.status).toBe("implemented");
  });

  it("keeps broad document-format CRUD planned", () => {
    for (const id of ["pdf-crud", "docx-crud", "xlsx-crud", "csv-crud", "pptx-crud"]) {
      expect(getCapabilityById(id)?.status).toBe("planned");
    }
  });

  it("does not promote deterministic engines that have not been built", () => {
    for (const id of ["npv", "irr", "dcf", "critical-path", "descriptive-statistics", "bar-chart"]) {
      expect(getCapabilityById(id)?.status).not.toBe("implemented");
    }
  });

  it("keeps credentialed private SEO retrieval unavailable while export analysis remains open-access", () => {
    for (const id of ["seo-keyword-metrics", "seo-backlink-metrics", "seo-search-console"]) {
      expect(getCapabilityById(id)?.status).toBe("unavailable");
    }
    for (const id of ["keyword-export-analysis", "backlink-export-analysis", "search-console-export-analysis"]) {
      expect(getCapabilityById(id)?.status).toBe("partial");
    }
  });
});
