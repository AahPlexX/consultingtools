import { describe, expect, it } from "vitest";
import {
  capabilities,
  capabilityDomains,
  capabilityStatuses,
  searchCapabilities,
} from "../src/catalog.js";

describe("capability catalog", () => {
  it("contains a broad consulting surface beyond the minimum requested scope", () => {
    expect(capabilities.length).toBeGreaterThanOrEqual(70);
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

  it("does not falsely mark file CRUD as implemented", () => {
    for (const id of ["pdf-crud", "docx-crud", "xlsx-crud", "csv-crud", "pptx-crud"]) {
      expect(capabilities.find((capability) => capability.id === id)?.status).toBe("planned");
    }
  });

  it("keeps external SEO metrics provider-dependent", () => {
    expect(capabilities.find(({ id }) => id === "seo-keyword-metrics")?.status).toBe(
      "provider-dependent",
    );
    expect(capabilities.find(({ id }) => id === "seo-backlink-metrics")?.status).toBe(
      "provider-dependent",
    );
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
