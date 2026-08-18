import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const checks = [
  {
    name: "@modelcontextprotocol/server",
    section: "dependencies",
    args: ["view", "@modelcontextprotocol/server", "dist-tags.latest", "--json"],
  },
  {
    name: "zod",
    section: "dependencies",
    args: ["view", "zod", "dist-tags.latest", "--json"],
  },
  {
    name: "typescript",
    section: "devDependencies",
    args: ["view", "typescript", "dist-tags.latest", "--json"],
  },
  {
    name: "vitest",
    section: "devDependencies",
    args: ["view", "vitest", "dist-tags.latest", "--json"],
  },
  {
    name: "@types/node",
    section: "devDependencies",
    args: ["view", "@types/node@24", "version", "--json"],
    select: highestStableVersion,
  },
];

export function parseNpmJson(stdout) {
  return JSON.parse(stdout.trim());
}

export function highestStableVersion(value) {
  const versions = Array.isArray(value) ? value : [value];
  const stable = versions.filter((version) => /^\d+\.\d+\.\d+$/.test(version));

  if (stable.length === 0) {
    throw new Error("npm returned no stable semantic versions for the requested line");
  }

  return stable.sort((left, right) => {
    const a = left.split(".").map(Number);
    const b = right.split(".").map(Number);
    return (a[0] - b[0]) || (a[1] - b[1]) || (a[2] - b[2]);
  }).at(-1);
}

export function findStalePins(packageJson, latest) {
  return checks.flatMap(({ name, section }) => {
    const pinned = packageJson[section]?.[name];
    const current = latest[name];

    if (typeof pinned !== "string") {
      throw new Error(`Missing governed dependency pin: ${section}.${name}`);
    }
    if (typeof current !== "string") {
      throw new Error(`Missing registry result for governed dependency: ${name}`);
    }

    return pinned === current ? [] : [{ name, pinned, current }];
  });
}

function queryCurrentVersions() {
  return Object.fromEntries(
    checks.map(({ name, args, select }) => {
      const stdout = execFileSync("npm", args, {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "inherit"],
      });
      const parsed = parseNpmJson(stdout);
      return [name, select ? select(parsed) : parsed];
    }),
  );
}

function run() {
  const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  const latest = queryCurrentVersions();
  const stale = findStalePins(packageJson, latest);

  if (stale.length > 0) {
    console.error("Critical runtime/toolchain pins are stale:");
    for (const item of stale) {
      console.error(`- ${item.name}: pinned ${item.pinned}; current ${item.current}`);
    }
    console.error("Revalidate release notes and compatibility before updating the pins on main.");
    process.exitCode = 1;
    return;
  }

  console.log("Critical runtime/toolchain pins match the current governed npm targets.");
}

const invokedPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : undefined;
if (invokedPath === import.meta.url) {
  run();
}
