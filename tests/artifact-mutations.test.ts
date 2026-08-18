import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { describe, expect, it } from "vitest";
import { createHttpHandler } from "../src/http.js";

async function connectedClient() {
  const handler = createHttpHandler();
  const transport = new StreamableHTTPClientTransport(new URL("http://test.local/mcp"), {
    fetch: (url, init) => handler.fetch(new Request(url, init)),
  });
  const client = new Client(
    { name: "artifact-mutation-test", version: "1.0.0" },
    { versionNegotiation: { mode: "auto" } },
  );
  await client.connect(transport);
  return { client, handler };
}

async function importText(client: Client, text: string) {
  const result = await client.callTool({
    name: "import_artifact_inline",
    arguments: {
      name: "working.txt",
      mimeType: "text/plain",
      dataBase64: Buffer.from(text, "utf8").toString("base64"),
    },
  });
  return (result.structuredContent as { artifact: { uri: string; revision: number } }).artifact;
}

describe("artifact mutation tools", () => {
  it("replaces only the expected current revision and exposes the new bytes", async () => {
    const { client, handler } = await connectedClient();

    try {
      const artifact = await importText(client, "before");
      const replaced = await client.callTool({
        name: "replace_artifact_inline",
        arguments: {
          artifactUri: artifact.uri,
          expectedRevision: 1,
          dataBase64: Buffer.from("after", "utf8").toString("base64"),
        },
      });

      expect(replaced.isError).not.toBe(true);
      const updated = (replaced.structuredContent as { artifact: { uri: string; revision: number } }).artifact;
      expect(updated.uri).toBe(artifact.uri);
      expect(updated.revision).toBe(2);

      const resource = await client.readResource({ uri: artifact.uri });
      expect(resource.contents[0]).toMatchObject({
        uri: artifact.uri,
        blob: Buffer.from("after", "utf8").toString("base64"),
      });
    } finally {
      await client.close();
      await handler.close();
    }
  });

  it("rejects a stale revision instead of overwriting a newer artifact", async () => {
    const { client, handler } = await connectedClient();

    try {
      const artifact = await importText(client, "original");
      await client.callTool({
        name: "replace_artifact_inline",
        arguments: {
          artifactUri: artifact.uri,
          expectedRevision: 1,
          dataBase64: Buffer.from("newer", "utf8").toString("base64"),
        },
      });

      const stale = await client.callTool({
        name: "replace_artifact_inline",
        arguments: {
          artifactUri: artifact.uri,
          expectedRevision: 1,
          dataBase64: Buffer.from("stale", "utf8").toString("base64"),
        },
      });

      expect(stale.isError).toBe(true);
      expect(stale.content).toContainEqual(
        expect.objectContaining({ type: "text", text: expect.stringMatching(/revision conflict/i) }),
      );
    } finally {
      await client.close();
      await handler.close();
    }
  });

  it("marks deletion as destructive and removes the resource from subsequent reads", async () => {
    const { client, handler } = await connectedClient();

    try {
      const tools = await client.listTools();
      const deleteTool = tools.tools.find((tool) => tool.name === "delete_artifact");
      expect(deleteTool?.annotations).toMatchObject({
        readOnlyHint: false,
        openWorldHint: false,
        destructiveHint: true,
      });

      const artifact = await importText(client, "delete me");
      const deleted = await client.callTool({
        name: "delete_artifact",
        arguments: { artifactUri: artifact.uri, expectedRevision: 1 },
      });
      expect(deleted.isError).not.toBe(true);
      expect(deleted.structuredContent).toEqual({
        deleted: true,
        artifactUri: artifact.uri,
        deletedRevision: 1,
      });

      await expect(client.readResource({ uri: artifact.uri })).rejects.toThrow();
    } finally {
      await client.close();
      await handler.close();
    }
  });
});
