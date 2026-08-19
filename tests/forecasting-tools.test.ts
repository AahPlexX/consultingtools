import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { describe, expect, it } from "vitest";
import { createHttpHandler } from "../src/http.js";

async function connectedClient() {
  const handler = createHttpHandler();
  const transport = new StreamableHTTPClientTransport(new URL("http://test.local/mcp"), {
    fetch: (url, init) => handler.fetch(new Request(url, init)),
  });
  const client = new Client(
    { name: "forecasting-tools-test", version: "1.0.0" },
    { versionNegotiation: { mode: "auto" } },
  );
  await client.connect(transport);
  return { client, handler };
}

const forecastingToolNames = [
  "forecast_baseline",
  "calculate_forecast_error_metrics",
  "backtest_forecast_baseline",
] as const;

describe("forecasting MCP tools", () => {
  it("exposes baseline forecasting tools with read-only closed-world annotations", async () => {
    const { client, handler } = await connectedClient();
    try {
      const tools = await client.listTools();
      for (const name of forecastingToolNames) {
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

  it("executes baseline forecasts and error metrics through MCP", async () => {
    const { client, handler } = await connectedClient();
    try {
      const forecast = await client.callTool({
        name: "forecast_baseline",
        arguments: { method: "seasonal-naive", values: [10, 20, 30, 11, 21, 31], horizon: 4, seasonLength: 3 },
      });
      expect(forecast.structuredContent).toMatchObject({ method: "seasonal-naive", forecast: [11, 21, 31, 11] });

      const metrics = await client.callTool({
        name: "calculate_forecast_error_metrics",
        arguments: { actual: [3, -0.5, 2, 7], predicted: [2.5, 0, 2, 8] },
      });
      expect(metrics.structuredContent).toMatchObject({ mae: 0.5, rmse: expect.any(Number) });
    } finally {
      await client.close();
      await handler.close();
    }
  });

  it("executes rolling-origin backtests without future leakage", async () => {
    const { client, handler } = await connectedClient();
    try {
      const backtest = await client.callTool({
        name: "backtest_forecast_baseline",
        arguments: {
          values: [1, 2, 3, 100, 200],
          method: "naive",
          minimumTrainingSize: 3,
          horizon: 1,
        },
      });
      expect(backtest.structuredContent).toMatchObject({
        rows: [
          { originIndex: 3, targetIndex: 3, actual: 100, predicted: 3 },
          { originIndex: 4, targetIndex: 4, actual: 200, predicted: 100 },
        ],
        metrics: { mae: 98.5 },
      });
    } finally {
      await client.close();
      await handler.close();
    }
  });

  it("returns MCP errors for invalid forecast configurations", async () => {
    const { client, handler } = await connectedClient();
    try {
      const invalid = await client.callTool({
        name: "forecast_baseline",
        arguments: { method: "drift", values: [1], horizon: 1 },
      });
      expect(invalid.isError).toBe(true);
      expect(invalid.content).toEqual(
        expect.arrayContaining([expect.objectContaining({ text: expect.stringMatching(/at least two/i) })]),
      );
    } finally {
      await client.close();
      await handler.close();
    }
  });
});
