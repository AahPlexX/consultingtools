import { isIP } from "node:net";

type IPv4Range = readonly [base: string, prefix: number];
type IPv6Range = readonly [base: string, prefix: number];

const blockedV4: readonly IPv4Range[] = [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.88.99.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
] as const;

const blockedV6: readonly IPv6Range[] = [
  ["::", 128],
  ["::1", 128],
  ["::ffff:0:0", 96],
  ["64:ff9b::", 96],
  ["64:ff9b:1::", 48],
  ["100::", 64],
  ["100:0:0:1::", 64],
  ["2001::", 23],
  ["2001:db8::", 32],
  ["2002::", 16],
  ["3fff::", 20],
  ["5f00::", 16],
  ["fc00::", 7],
  ["fe80::", 10],
  ["fec0::", 10],
  ["ff00::", 8],
] as const;

function ipv4ToNumber(address: string): number {
  const parts = address.split(".");
  if (parts.length !== 4) throw new Error(`IP address is malformed: ${address}.`);
  let value = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) throw new Error(`IP address is malformed: ${address}.`);
    const octet = Number(part);
    if (octet < 0 || octet > 255) throw new Error(`IP address is malformed: ${address}.`);
    value = ((value << 8) | octet) >>> 0;
  }
  return value;
}

function inV4Range(address: string, range: IPv4Range): boolean {
  const value = ipv4ToNumber(address);
  const base = ipv4ToNumber(range[0]);
  const mask = range[1] === 0 ? 0 : (0xffffffff << (32 - range[1])) >>> 0;
  return ((value & mask) >>> 0) === ((base & mask) >>> 0);
}

function ipv4TailToHex(value: string): [string, string] {
  const number = ipv4ToNumber(value);
  return [((number >>> 16) & 0xffff).toString(16), (number & 0xffff).toString(16)];
}

function ipv6ToBigInt(address: string): bigint {
  let input = address.toLowerCase();
  if (input.includes("%")) throw new Error(`IP address zone identifiers are not permitted: ${address}.`);

  if (input.includes(".")) {
    const separator = input.lastIndexOf(":");
    if (separator < 0) throw new Error(`IP address is malformed: ${address}.`);
    const [high, low] = ipv4TailToHex(input.slice(separator + 1));
    input = `${input.slice(0, separator)}:${high}:${low}`;
  }

  const doubleColon = input.indexOf("::");
  if (doubleColon !== -1 && doubleColon !== input.lastIndexOf("::")) {
    throw new Error(`IP address is malformed: ${address}.`);
  }

  const leftText = doubleColon === -1 ? input : input.slice(0, doubleColon);
  const rightText = doubleColon === -1 ? "" : input.slice(doubleColon + 2);
  const left = leftText === "" ? [] : leftText.split(":");
  const right = rightText === "" ? [] : rightText.split(":");
  const missing = doubleColon === -1 ? 0 : 8 - left.length - right.length;
  if ((doubleColon === -1 && left.length !== 8) || missing < 1) {
    throw new Error(`IP address is malformed: ${address}.`);
  }
  const parts = doubleColon === -1 ? left : [...left, ...Array.from({ length: missing }, () => "0"), ...right];
  if (parts.length !== 8) throw new Error(`IP address is malformed: ${address}.`);

  let result = 0n;
  for (const part of parts) {
    if (!/^[0-9a-f]{1,4}$/.test(part)) throw new Error(`IP address is malformed: ${address}.`);
    result = (result << 16n) | BigInt(`0x${part}`);
  }
  return result;
}

function inV6Range(address: string, range: IPv6Range): boolean {
  const value = ipv6ToBigInt(address);
  const base = ipv6ToBigInt(range[0]);
  const shift = BigInt(128 - range[1]);
  return (value >> shift) === (base >> shift);
}

export function normalizeIpAddress(address: string): string {
  const trimmed = address.trim().toLowerCase();
  if (isIP(trimmed) === 4) return trimmed.split(".").map((part) => String(Number(part))).join(".");
  if (isIP(trimmed) !== 6) throw new Error(`IP address is malformed: ${address}.`);
  const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i.exec(trimmed);
  if (mapped?.[1]) return normalizeIpAddress(mapped[1]);
  return ipv6ToBigInt(trimmed).toString(16).padStart(32, "0");
}

export function assertPublicIpAddress(address: string): void {
  const trimmed = address.trim().toLowerCase();
  const family = isIP(trimmed);
  if (family === 0) throw new Error(`IP address is malformed: ${address}.`);

  if (family === 4) {
    if (blockedV4.some((range) => inV4Range(trimmed, range))) {
      throw new Error(`IP address is not permitted for public-web access: ${address}.`);
    }
    return;
  }

  if (blockedV6.some((range) => inV6Range(trimmed, range))) {
    throw new Error(`IP address is not permitted for public-web access: ${address}.`);
  }
}
