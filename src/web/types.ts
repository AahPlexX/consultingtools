export interface DnsAddress {
  address: string;
  family: 4 | 6;
}

export interface PublicFetchRedirect {
  from: string;
  to: string;
  status: number;
}

export interface PublicFetchResult {
  requestedUrl: string;
  finalUrl: string;
  status: number;
  headers: Record<string, string>;
  body: Buffer;
  fetchedAt: string;
  sha256: string;
  redirects: PublicFetchRedirect[];
}

export const PUBLIC_FETCH_LIMITS = {
  maxBytes: 5 * 1024 * 1024,
  maxRedirects: 5,
  timeoutMs: 10_000,
} as const;
