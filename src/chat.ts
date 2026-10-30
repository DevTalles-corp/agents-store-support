import {
  Agent,
  type AgentInputItem,
  MemorySession,
  run,
  user,
} from "@openai/agents";
import { MODEL } from "./config.js";
import * as readline from "node:readline/promises";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Falta el OPENAI_API_KEY en el archivo .env");
}
const agent = new Agent({
  name: "Store Assistant",
  instructions: `Eres el asistente de soporte de una tienda online.
     Responde en español en dos o tres frases con un tono cercano .
     Si no sabes algo, lo dices: nunca inventas datos. `,
  model: MODEL,
  modelSettings: {
    text: { verbosity: "low" },
  },
});
const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const session = new MemorySession();

while (true) {
  const message = (await terminal.question("Tú: ")).trim();
  if (!message) continue;
  if (message === "salir") break;

  const result = await run(agent, message, { session });
  console.log(`\nAsistente: ${result.finalOutput}\n`);
}
terminal.close();
