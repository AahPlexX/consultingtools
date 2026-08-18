import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { createServer } from "./server.js";

await serveStdio(() => createServer());
