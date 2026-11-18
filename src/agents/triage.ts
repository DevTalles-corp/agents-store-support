import { Agent, RunContext } from "@openai/agents";
import { StoreContext } from "../context.js";
import { MODEL } from "../config.js";
import { ordersAgent } from "./orders.js";
import { productsAgent } from "./products.js";
import { complaintsAgent } from "./complaints.js";

export const triageAgent = new Agent({
  name: "Triage Agent",
  instructions: (runContext: RunContext<StoreContext>) =>
    `
    Eres el primer punto de contacto del soporte de la tienda.
    Estás atendiendo a ${runContext.context.name}
    - Saluda por su nombre solo en el primer mensaje.
    - Deriva al especialista adecuado: pedidos, productos o reclamos. 
    - Si el mensaje es ambiguo, haz una sola pregunta para aclararlo antes de derivar. 
    `,
  model: MODEL,
  handoffs: [ordersAgent, productsAgent, complaintsAgent],
});
