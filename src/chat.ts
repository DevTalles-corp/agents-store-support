import { Agent, run } from "@openai/agents";
import { MODEL } from "./config.js";
import * as readline from "node:readline/promises";
import { FileSession } from "./memory/fileSession.js";
import { lastItems } from "./memory/historyWindow.js";
import { getOrderTool } from "./tools/orders.js";

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
  tools: [getOrderTool],
});
const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const session = new FileSession("C-001");
console.log(
  'Chat de soporte. Escribe "salir" para terminar o "/borrar" para olvidar la conversación.\n',
);

while (true) {
  const message = (await terminal.question("Tú: ")).trim();
  if (!message) continue;
  if (message === "salir") break;
  if (message === "/borrar") {
    await session.clearSession();
    console.log("Historial borrado.\n");
    continue;
  }

  const result = await run(agent, message, {
    session,
    sessionInputCallback: lastItems(30),
    maxTurns: 5,
  });
  for (const item of result.newItems) {
    if (
      item.type === "tool_call_item" &&
      item.rawItem.type === "function_call"
    ) {
      console.log(` ${item.rawItem.name} (${item.rawItem.arguments})`);
    } else if (item.type === "tool_call_output_item") {
      console.log(item.output);
    }
  }
  console.log(`\nAsistente: ${result.finalOutput}\n`);
}
terminal.close();