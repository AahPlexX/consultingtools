import { describe, expect, it } from "vitest";
import {
  capabilities,
  capabilityDomains,
  capabilityStatuses,
  getCapabilityById,
  searchCapabilities,
} from "../src/catalog.js";

describe("capability catalog", () => {
  it("contains at least 100 materially cataloged routing-ready capabilities", () => {
    expect(capabilities.length).toBeGreaterThanOrEqual(100);
    expect(capabilities.every(({ routingReady }) => routingReady)).toBe(true);
  });

  it("uses unique stable ids and governed status/domain values", () => {
    const ids = capabilities.map(({ id }) => id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const capability of capabilities) {
      expect(capabilityStatuses).toContain(capability.status);
      expect(capabilityDomains).toContain(capability.domain);
      expect(capability.summary.trim().length).toBeGreaterThan(20);
    }
  });

  it("preserves stable ids during catalog modularization", () => {
    expect(getCapabilityById("swot")?.name).toBe("SWOT analysis");
    expect(getCapabilityById("break-even")?.domain).toBe("finance");
    expect(getCapabilityById("pdf-crud")?.status).toBe("planned");
  });

  it("does not falsely mark file CRUD as implemented", () => {
    for (const id of ["pdf-crud", "docx-crud", "xlsx-crud", "csv-crud", "pptx-crud"]) {
      expect(getCapabilityById(id)?.status).toBe("planned");
    }
  });

  it("marks private-account SEO metrics unavailable under open access", () => {
    for (const id of ["seo-keyword-metrics", "seo-backlink-metrics", "seo-search-console"]) {
      expect(getCapabilityById(id)?.status).toBe("unavailable");
    }
  });

  it("searches by query and filters without exceeding the bound", () => {
    const seo = searchCapabilities({ domain: "seo", limit: 50 });
    expect(seo.length).toBeGreaterThan(0);
    expect(seo.every(({ domain }) => domain === "seo")).toBe(true);

    const planned = searchCapabilities({ status: "planned", limit: 50 });
    expect(planned.every(({ status }) => status === "planned")).toBe(true);

    const result = searchCapabilities({ query: "cash", limit: 1 });
    expect(result).toHaveLength(1);
    expect(result[0]?.summary.toLocaleLowerCase()).toContain("cash");
  });
});
