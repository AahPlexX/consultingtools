export interface ArtifactMetadata {
  id: string;
  uri: string;
  name: string;
  mimeType: string;
  byteSize: number;
  sha256: string;
  revision: number;
  createdAt: string;
  modifiedAt: string;
}

export interface ArtifactSnapshot {
  metadata: ArtifactMetadata;
  bytes: Buffer;
}

export interface ArtifactCreateInput {
  name: string;
  mimeType: string;
  bytes: Buffer;
}

export interface ArtifactReplaceInput {
  bytes: Buffer;
  name?: string;
  mimeType?: string;
}

export interface ArtifactStore {
  create(input: ArtifactCreateInput): Promise<ArtifactMetadata>;
  read(id: string, revision?: number): Promise<ArtifactSnapshot>;
  replace(id: string, input: ArtifactReplaceInput): Promise<ArtifactMetadata>;
  delete(id: string): Promise<void>;
}
