import { describe, expect, it } from "vitest";
import { normalizePublicWebUrl } from "../src/web/url-policy.js";

describe("public web URL policy", () => {
  it("normalizes web URLs, removes fragments, and permits only default ports", () => {
    expect(normalizePublicWebUrl("HTTPS://Example.COM:443/a/../report?q=1#section").href)
      .toBe("https://example.com/report?q=1");
    expect(normalizePublicWebUrl("http://example.com:80/").href).toBe("http://example.com/");
  });

  it.each([
    "ftp://example.com/file",
    "file:///etc/passwd",
    "data:text/plain,hello",
    "https://user:pass@example.com/",
    "http://example.com:8080/",
    "https://example.com:8443/",
    "not a url",
  ])("rejects unsafe or unsupported URL %s", (value) => {
    expect(() => normalizePublicWebUrl(value)).toThrow(/url|scheme|port|credential|http/i);
  });

  it("rejects empty hostnames", () => {
    expect(() => normalizePublicWebUrl("https:///path-only")).toThrow(/url|host/i);
  });
});
