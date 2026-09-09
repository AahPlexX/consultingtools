import { describe, expect, it } from "vitest";
import { assertPublicIpAddress } from "../src/web/ip-policy.js";

describe("public web IP policy", () => {
  it.each([
    "8.8.8.8",
    "1.1.1.1",
    "2606:4700:4700::1111",
    "2001:4860:4860::8888",
  ])("accepts representative globally routable address %s", (address) => {
    expect(() => assertPublicIpAddress(address)).not.toThrow();
  });

  it.each([
    "127.0.0.1",
    "10.0.0.1",
    "172.16.0.1",
    "192.168.1.1",
    "169.254.1.1",
    "100.64.0.1",
    "0.0.0.0",
    "224.0.0.1",
    "192.0.2.1",
    "198.18.0.1",
    "240.0.0.1",
    "::1",
    "fc00::1",
    "fe80::1",
    "::",
    "ff02::1",
    "2001:db8::1",
    "::ffff:127.0.0.1",
    "::ffff:10.0.0.1",
  ])("rejects non-public address %s", (address) => {
    expect(() => assertPublicIpAddress(address)).toThrow(/public|network|address/i);
  });

  it("rejects malformed IP text rather than treating it as a hostname", () => {
    expect(() => assertPublicIpAddress("999.1.1.1")).toThrow(/address/i);
    expect(() => assertPublicIpAddress("example.com")).toThrow(/address/i);
  });
});
