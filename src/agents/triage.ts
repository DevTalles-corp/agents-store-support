import { Agent, handoff, RunContext } from "@openai/agents";
import { StoreContext } from "../context.js";
import { MODEL } from "../config.js";
import { ordersAgent } from "./orders.js";
import { productsAgent } from "./products.js";
import { complaintsAgent } from "./complaints.js";
import { RECOMMENDED_PROMPT_PREFIX } from "@openai/agents-core/extensions";
import z from "zod";
import { askPolicesTool } from "./policies.js";
import { cardNumberGuardrail } from "../guardrails/cardNumber.js";
import { topicGuardrail } from "../guardrails/topic.js";

const complaintsHandoff = handoff(complaintsAgent, {
  inputType: z.object({
    summary: z.string().describe("Resumen del problema en una oración"),
  }),
  onHandoff: (runContext: RunContext<StoreContext>, data) => {
    console.log(
      `[handoff] Reclamo de ${runContext.context.customerId}: ${data?.summary}`,
    );
  },
});

export const triageAgent = new Agent({
  name: "Triage Agent",
  inputGuardrails: [cardNumberGuardrail, topicGuardrail],
  instructions: (runContext: RunContext<StoreContext>) =>
    `
    ${RECOMMENDED_PROMPT_PREFIX}
    Eres el primer punto de contacto del soporte de la tienda.
    Estás atendiendo a ${runContext.context.name}
    - Saluda por su nombre solo en el primer mensaje.
    Especialistas:
    - Products Agent: catálogo, precios, stock, recomendaciones.
    - Orders Agent: estado, ubicación o seguimiento de un pedido ("¿dónde está mi pedido?", números de pedido).
    - Complaints Agent: problemas, daños, reclamos, devoluciones.
    Reglas:
    - Si un especialista te devuelve la conversación, revisa el historial, identifica la parte del mensaje
      del cliente que aún no se respondió y transfiérela de inmediato al especialista que corresponde.
      No le hagas preguntas al cliente.
    - Nunca derives a un especialista que ya respondió su parte en este turno.
    - "¿Dónde está mi pedido X?" siempre va a Orders Agent, sin preguntar.
    - Solo pide aclaración si el mensaje no permite saber a qué especialista derivar.
    - Para dudas de envíos, devoluciones o garantía, usa ask_policies y responde tú. 
    `,
  model: MODEL,
  tools: [askPolicesTool],
  handoffs: [ordersAgent, productsAgent, complaintsHandoff],
});

const triageRouter = triageAgent.clone({
  tools: [],
  modelSettings: { toolChoice: "required" },
});

ordersAgent.handoffs = [triageRouter];
productsAgent.handoffs = [triageRouter];
complaintsAgent.handoffs = [triageRouter];
