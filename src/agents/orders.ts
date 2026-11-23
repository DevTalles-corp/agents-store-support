import { Agent } from "@openai/agents";
import { ORDER_INTRUCTIONS } from "../shared/instructions.js";
import { MODEL } from "../config.js";
import { getOrderTool, listMyOrdersTool } from "../tools/orders.js";
import type { StoreContext } from "../context.js";
import { RECOMMENDED_PROMPT_PREFIX } from "@openai/agents-core/extensions";

export const ordersAgent = new Agent<StoreContext>({
  name: "Orders Agent",
  handoffDescription: "Estado de pedidos, fechas de entrega y transportistas.",
  instructions: `${RECOMMENDED_PROMPT_PREFIX}\n${ORDER_INTRUCTIONS}`,
  model: MODEL,
  modelSettings: { toolChoice: "required" },
  tools: [getOrderTool, listMyOrdersTool],
});
