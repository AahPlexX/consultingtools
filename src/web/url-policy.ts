import { isIP } from "node:net";

function unbracket(value: string): string {
  return value.startsWith("[") && value.endsWith("]") ? value.slice(1, -1) : value;
}

export function normalizePublicWebUrl(value: string): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Public-web URL must be an absolute valid URL.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Public-web URL scheme must be http or https.");
  }
  if (url.username !== "" || url.password !== "") {
    throw new Error("Public-web URLs must not contain credentials.");
  }
  if (url.hostname === "") throw new Error("Public-web URL must contain a hostname.");
  if (url.port !== "") throw new Error("Public-web URLs may use only the default HTTP/HTTPS port.");

  const bareHost = unbracket(url.hostname);
  if (isIP(bareHost) === 0) {
    const normalizedHost = bareHost.endsWith(".") ? bareHost.slice(0, -1) : bareHost;
    if (!normalizedHost.includes(".")) {
      throw new Error("Public-web hostnames must be fully qualified rather than single-label/local names.");
    }
    url.hostname = normalizedHost;
  }

  url.hash = "";
  return url;
}
