import { describe, expect, it } from "vitest";
import { ArtifactNotFoundError, MemoryArtifactStore } from "../src/artifacts/memory-store.js";

describe("MemoryArtifactStore", () => {
  it("preserves prior revisions when an artifact is replaced", async () => {
    const store = new MemoryArtifactStore({ maxArtifactBytes: 64 });
    const created = await store.create({
      name: "model.csv",
      mimeType: "text/csv",
      bytes: Buffer.from("a,b\n1,2\n", "utf8"),
    });

    const updated = await store.replace(created.id, {
      bytes: Buffer.from("a,b\n3,4\n", "utf8"),
    });

    expect(created.revision).toBe(1);
    expect(updated.revision).toBe(2);
    expect((await store.read(created.id, 1)).bytes.toString("utf8")).toBe("a,b\n1,2\n");
    expect((await store.read(created.id)).bytes.toString("utf8")).toBe("a,b\n3,4\n");
  });

  it("deletes the active artifact without silently resurrecting older revisions", async () => {
    const store = new MemoryArtifactStore({ maxArtifactBytes: 64 });
    const created = await store.create({
      name: "obsolete.txt",
      mimeType: "text/plain",
      bytes: Buffer.from("obsolete", "utf8"),
    });

    await store.delete(created.id);

    await expect(store.read(created.id)).rejects.toBeInstanceOf(ArtifactNotFoundError);
    await expect(store.read(created.id, 1)).rejects.toBeInstanceOf(ArtifactNotFoundError);
  });
});
