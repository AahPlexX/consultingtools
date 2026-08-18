import { createHash, randomUUID } from "node:crypto";
import type {
  ArtifactCreateInput,
  ArtifactMetadata,
  ArtifactReplaceInput,
  ArtifactSnapshot,
  ArtifactStore,
} from "./types.js";

const DEFAULT_MAX_ARTIFACT_BYTES = 16 * 1024 * 1024;

interface StoredArtifact {
  deleted: boolean;
  revisions: ArtifactSnapshot[];
}

export class ArtifactNotFoundError extends Error {
  constructor(id: string) {
    super(`Artifact ${id} was not found.`);
    this.name = "ArtifactNotFoundError";
  }
}

export class ArtifactSizeLimitError extends Error {
  constructor(actual: number, maximum: number) {
    super(`Artifact size limit exceeded: ${actual} bytes is greater than the configured ${maximum}-byte limit.`);
    this.name = "ArtifactSizeLimitError";
  }
}

function normalizeName(value: string): string {
  const name = value.replace(/[\u0000-\u001f\u007f]/g, "").trim();
  if (name.length === 0) throw new Error("Artifact name must not be empty.");
  if (name.length > 255) throw new Error("Artifact name must be 255 characters or fewer.");
  return name;
}

function normalizeMimeType(value: string): string {
  const mimeType = value.trim().toLowerCase();
  if (!/^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+*-]+$/.test(mimeType)) {
    throw new Error("Artifact mimeType must be a valid type/subtype value.");
  }
  return mimeType;
}

function digest(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function cloneSnapshot(snapshot: ArtifactSnapshot): ArtifactSnapshot {
  return {
    metadata: { ...snapshot.metadata },
    bytes: Buffer.from(snapshot.bytes),
  };
}

export interface MemoryArtifactStoreOptions {
  maxArtifactBytes?: number;
}

export class MemoryArtifactStore implements ArtifactStore {
  readonly maxArtifactBytes: number;
  readonly #artifacts = new Map<string, StoredArtifact>();

  constructor(options: MemoryArtifactStoreOptions = {}) {
    const maximum = options.maxArtifactBytes ?? DEFAULT_MAX_ARTIFACT_BYTES;
    if (!Number.isSafeInteger(maximum) || maximum < 1) {
      throw new Error("maxArtifactBytes must be a positive safe integer.");
    }
    this.maxArtifactBytes = maximum;
  }

  async create(input: ArtifactCreateInput): Promise<ArtifactMetadata> {
    this.#assertSize(input.bytes);
    const id = randomUUID();
    const timestamp = new Date().toISOString();
    const metadata: ArtifactMetadata = {
      id,
      uri: `artifact://${id}`,
      name: normalizeName(input.name),
      mimeType: normalizeMimeType(input.mimeType),
      byteSize: input.bytes.byteLength,
      sha256: digest(input.bytes),
      revision: 1,
      createdAt: timestamp,
      modifiedAt: timestamp,
    };

    this.#artifacts.set(id, {
      deleted: false,
      revisions: [{ metadata, bytes: Buffer.from(input.bytes) }],
    });
    return { ...metadata };
  }

  async read(id: string, revision?: number): Promise<ArtifactSnapshot> {
    const artifact = this.#artifacts.get(id);
    if (!artifact || artifact.deleted) throw new ArtifactNotFoundError(id);

    const snapshot =
      revision === undefined
        ? artifact.revisions.at(-1)
        : artifact.revisions.find((entry) => entry.metadata.revision === revision);
    if (!snapshot) throw new ArtifactNotFoundError(`${id}@${revision}`);
    return cloneSnapshot(snapshot);
  }

  async replace(id: string, input: ArtifactReplaceInput): Promise<ArtifactMetadata> {
    const artifact = this.#artifacts.get(id);
    if (!artifact || artifact.deleted) throw new ArtifactNotFoundError(id);
    this.#assertSize(input.bytes);

    const previous = artifact.revisions.at(-1);
    if (!previous) throw new ArtifactNotFoundError(id);
    const metadata: ArtifactMetadata = {
      id,
      uri: previous.metadata.uri,
      name: input.name === undefined ? previous.metadata.name : normalizeName(input.name),
      mimeType:
        input.mimeType === undefined
          ? previous.metadata.mimeType
          : normalizeMimeType(input.mimeType),
      byteSize: input.bytes.byteLength,
      sha256: digest(input.bytes),
      revision: previous.metadata.revision + 1,
      createdAt: previous.metadata.createdAt,
      modifiedAt: new Date().toISOString(),
    };

    artifact.revisions.push({ metadata, bytes: Buffer.from(input.bytes) });
    return { ...metadata };
  }

  async delete(id: string): Promise<void> {
    const artifact = this.#artifacts.get(id);
    if (!artifact || artifact.deleted) throw new ArtifactNotFoundError(id);
    artifact.deleted = true;
  }

  #assertSize(bytes: Buffer): void {
    if (bytes.byteLength > this.maxArtifactBytes) {
      throw new ArtifactSizeLimitError(bytes.byteLength, this.maxArtifactBytes);
    }
  }
}
