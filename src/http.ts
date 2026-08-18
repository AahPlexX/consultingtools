import { createMcpHandler } from "@modelcontextprotocol/server";
import { createServer } from "./server.js";

export function createHttpHandler() {
  return createMcpHandler(() => createServer());
}

export default createHttpHandler();
