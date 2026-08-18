import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { describe, expect, it } from "vitest";
import { createHttpHandler } from "../src/http.js";
import { MemoryArtifactStore } from "../src/artifacts/memory-store.js";

async function connectedArtifactClient(maxArtifactBytes = 1024) {
  const artifactStore = new MemoryArtifactStore({ maxArtifactBytes });
  const handler = createHttpHandler({ artifactStore });
  const transport = new StreamableHTTPClientTransport(new URL("http://test.local/mcp"), {
    fetch: (url, init) => handler.fetch(new Request(url, init)),
  });
  const client = new Client(
    { name: "artifact-test", version: "1.0.0" },
    { versionNegotiation: { mode: "auto" } },
  );
  await client.connect(transport);
  return { client, handler };
}

describe("artifact workspace", () => {
  it("imports bounded inline bytes and exposes them as a readable MCP resource", async () => {
    const { client, handler } = await connectedArtifactClient();

    try {
      const imported = await client.callTool({
        name: "import_artifact_inline",
        arguments: {
          name: "evidence.txt",
          mimeType: "text/plain",
          dataBase64: Buffer.from("consulting evidence", "utf8").toString("base64"),
        },
      });

      expect(imported.isError).not.toBe(true);
      const structured = imported.structuredContent as {
        artifact: { uri: string; byteSize: number; sha256: string; revision: number };
      };
      expect(structured.artifact.uri).toMatch(/^artifact:\/\/[0-9a-f-]+$/);
      expect(structured.artifact.byteSize).toBe(19);
      expect(structured.artifact.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(structured.artifact.revision).toBe(1);
      expect(imported.content).toContainEqual(
        expect.objectContaining({
          type: "resource_link",
          uri: structured.artifact.uri,
          name: "evidence.txt",
          mimeType: "text/plain",
        }),
      );

      const resource = await client.readResource({ uri: structured.artifact.uri });
      expect(resource.contents).toEqual([
        expect.objectContaining({
          uri: structured.artifact.uri,
          mimeType: "text/plain",
          blob: Buffer.from("consulting evidence", "utf8").toString("base64"),
        }),
      ]);
    } finally {
      await client.close();
      await handler.close();
    }
  });

  it("returns a tool error instead of decoding an artifact larger than the configured limit", async () => {
    const { client, handler } = await connectedArtifactClient(4);

    try {
      const result = await client.callTool({
        name: "import_artifact_inline",
        arguments: {
          name: "too-large.bin",
          mimeType: "application/octet-stream",
          dataBase64: Buffer.from("12345", "utf8").toString("base64"),
        },
      });

      expect(result.isError).toBe(true);
      expect(result.content).toContainEqual(
        expect.objectContaining({ type: "text", text: expect.stringMatching(/size limit/i) }),
      );
    } finally {
      await client.close();
      await handler.close();
    }
  });
});
