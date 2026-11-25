import {
  Agent,
  InputGuardrailTripwireTriggered,
  run,
  RunContext,
} from "@openai/agents";
import { MODEL } from "./config.js";
import * as readline from "node:readline/promises";
import { FileSession } from "./memory/fileSession.js";
import { lastItems } from "./memory/historyWindow.js";
import { getOrderTool, listMyOrdersTool } from "./tools/orders.js";
import { findCustomer } from "./data/store.js";
import { StoreContext } from "./context.js";
import { getProductTool, searchProductsTool } from "./tools/products.js";
import { triageAgent } from "./agents/triage.js";

try {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Falta el OPENAI_API_KEY en el archivo .env");
  }

  const customerId = process.argv[2] ?? "C-001";
  const customer = await findCustomer(customerId);
  if (!customer) {
    throw new Error(`No existe el cliente: ${customerId} `);
  }
  const context: StoreContext = {
    customerId: customer.id,
    name: customer.name,
  };
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

    let result;
    try {
      result = await run(triageAgent, message, {
        context,
        session,
        sessionInputCallback: lastItems(30),
        maxTurns: 10,
      });
    } catch (error) {
      if (error instanceof InputGuardrailTripwireTriggered) {
        const { guardrail, output } = error.result;
        console.log(`[guardrail] ${guardrail.name}`, output.outputInfo);
        if (guardrail.name === "Card Number Guardrail") {
          console.log(
            `\n[Tienda] Por seguridad, nunca compartas los datos de tu tarjeta en el chat.\n`,
          );
        } else {
          console.log(
            `\n[Tienda] Solo puedo ayudarte con temas de la tienda.\n`,
          );
        }
        continue;
      }
      throw error;
    }

    for (const item of result.newItems) {
      if (item.type === "handoff_output_item") {
        console.log(`🔀 ${item.sourceAgent.name} → ${item.targetAgent.name}`);
      } else if (
        item.type === "tool_call_item" &&
        item.rawItem.type === "function_call"
      ) {
        console.log(`🔧 ${item.rawItem.name}(${item.rawItem.arguments})`);
      } else if (item.type === "message_output_item") {
        console.log(`\n[${item.agent.name}] ${item.content}`);
      }
    }
    console.log(`Asistente: ${result.finalOutput}\n`);
  }
  terminal.close();
} catch (error) {
  console.log(error instanceof Error ? error.message : String(error));
}
