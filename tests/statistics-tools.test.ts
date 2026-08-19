import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { describe, expect, it } from "vitest";
import { createHttpHandler } from "../src/http.js";

async function connectedClient() {
  const handler = createHttpHandler();
  const transport = new StreamableHTTPClientTransport(new URL("http://test.local/mcp"), {
    fetch: (url, init) => handler.fetch(new Request(url, init)),
  });
  const client = new Client(
    { name: "statistics-tools-test", version: "1.0.0" },
    { versionNegotiation: { mode: "auto" } },
  );
  await client.connect(transport);
  return { client, handler };
}

const statisticsToolNames = [
  "profile_data_column",
  "calculate_descriptive_statistics",
  "calculate_correlation",
  "calculate_mean_confidence_interval",
  "calculate_welch_t_test",
  "calculate_autocorrelation",
] as const;

describe("statistics MCP tools", () => {
  it("exposes focused statistics tools with read-only closed-world annotations", async () => {
    const { client, handler } = await connectedClient();
    try {
      const tools = await client.listTools();
      for (const name of statisticsToolNames) {
        expect(tools.tools.find((tool) => tool.name === name)?.annotations).toMatchObject({
          readOnlyHint: true,
          openWorldHint: false,
          destructiveHint: false,
        });
      }
    } finally {
      await client.close();
      await handler.close();
    }
  });

  it("executes profiling, descriptive statistics, and correlation through MCP", async () => {
    const { client, handler } = await connectedClient();
    try {
      const profile = await client.callTool({
        name: "profile_data_column",
        arguments: { values: [null, 1, "2", true] },
      });
      expect(profile.structuredContent).toMatchObject({
        missingCount: 1,
        counts: { finiteNumber: 1, string: 1, boolean: 1 },
        numericClean: false,
      });

      const descriptive = await client.callTool({
        name: "calculate_descriptive_statistics",
        arguments: { values: [1, 2, 3, 4, 5] },
      });
      expect(descriptive.structuredContent).toMatchObject({ mean: 3, sampleVariance: 2.5, q1: 2, q3: 4 });

      const correlation = await client.callTool({
        name: "calculate_correlation",
        arguments: { kind: "spearman", x: [1, 2, 2, 4], y: [10, 20, 30, 40] },
      });
      expect(correlation.structuredContent).toMatchObject({ kind: "spearman", result: { correlation: expect.any(Number) } });
    } finally {
      await client.close();
      await handler.close();
    }
  });

  it("executes t inference and autocorrelation through MCP", async () => {
    const { client, handler } = await connectedClient();
    try {
      const interval = await client.callTool({
        name: "calculate_mean_confidence_interval",
        arguments: { values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], confidenceLevel: 0.95 },
      });
      expect(interval.structuredContent).toMatchObject({ degreesOfFreedom: 9, mean: 5.5 });

      const welch = await client.callTool({
        name: "calculate_welch_t_test",
        arguments: {
          sampleA: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          sampleB: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
          confidenceLevel: 0.95,
        },
      });
      expect(welch.structuredContent).toMatchObject({ rejectNullAtAlpha: true, twoSidedPValue: expect.any(Number) });

      const autocorrelation = await client.callTool({
        name: "calculate_autocorrelation",
        arguments: { values: [1, 2, 3, 4, 5], lag: 1 },
      });
      expect(autocorrelation.structuredContent).toMatchObject({ autocorrelation: 0.4, lag: 1 });
    } finally {
      await client.close();
      await handler.close();
    }
  });

  it("returns MCP errors for undefined statistical domains", async () => {
    const { client, handler } = await connectedClient();
    try {
      const invalid = await client.callTool({
        name: "calculate_correlation",
        arguments: { kind: "pearson", x: [1, 1, 1], y: [1, 2, 3] },
      });
      expect(invalid.isError).toBe(true);
      expect(invalid.content).toEqual(
        expect.arrayContaining([expect.objectContaining({ text: expect.stringMatching(/zero variance/i) })]),
      );
    } finally {
      await client.close();
      await handler.close();
    }
  });
});
