import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { setTimeout } from "node:timers/promises";

// Local REST fixture. It accepts MGET always; LPUSH/INCR only after
// `/reset?mutations=allow`, so cache and ranking benchmarks stay read-only.
const counters: Record<
  string,
  { requests: number; commands: number; keys: number }
> = {};
let delayMs = 0;
let mutationsAllowed = false;
async function handleRequest(
  request: IncomingMessage,
  response: ServerResponse,
) {
  response.setHeader("Content-Type", "application/json");
  if (request.url === "/stats") {
    response.end(JSON.stringify({ delayMs, mutationsAllowed, counters }));
    return;
  }
  if (request.url?.startsWith("/reset?")) {
    const parameters = new URL(request.url, "http://localhost").searchParams;
    delayMs = Number(parameters.get("delay"));
    mutationsAllowed = parameters.get("mutations") === "allow";
    for (const key of Object.keys(counters)) delete counters[key];
    response.end("{}");
    return;
  }
  try {
    const chunks: Buffer[] = [];
    for await (const chunk of request)
      chunks.push(Buffer.from(chunk as Uint8Array));
    const body: unknown = JSON.parse(Buffer.concat(chunks).toString());
    if (!Array.isArray(body)) throw new Error("Expected a command array");
    const commands: unknown[] = Array.isArray(body[0]) ? body : [body];
    const name = request.url?.split("/")[1] ?? "unknown";
    const count = (counters[name] ??= { requests: 0, commands: 0, keys: 0 });
    count.requests++;
    const results = commands.map((command) => {
      if (!Array.isArray(command)) throw new Error("Expected a command array");
      const verb = String(command[0]).toLowerCase();
      if (verb === "mget") {
        count.commands++;
        const keys: unknown[] = command.slice(1);
        count.keys += keys.length;
        return {
          result: keys.map((key) => {
            if (typeof key !== "string") throw new Error("Expected string key");
            const match = /^(cute|cite)-pokemon:(\d+):(wins|losses)$/.exec(key);
            if (!match) throw new Error(`Unexpected key: ${key}`);
            const id = Number(match[2]);
            return match[3] === "wins" ? (id * 17) % 101 : (id * 13) % 97;
          }),
        };
      }
      if (!mutationsAllowed) {
        throw new Error("Only MGET is allowed in this fixture");
      }
      if (verb === "lpush" || verb === "incr") {
        count.commands++;
        return { result: 1 };
      }
      throw new Error(`Unsupported mutation: ${verb}`);
    });
    if (delayMs) await setTimeout(delayMs);
    response.end(JSON.stringify(Array.isArray(body[0]) ? results : results[0]));
  } catch (error) {
    response.statusCode = 400;
    response.end(JSON.stringify({ error: String(error) }));
  }
}

const server = createServer((request, response) => {
  void handleRequest(request, response);
});

server.listen(4310, "127.0.0.1", () => {
  console.log("Read-only fixture KV listening on http://127.0.0.1:4310");
});
