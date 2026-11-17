import { Agent } from "@openai/agents";
import { ORDER_INTRUCTIONS } from "../shared/instructions.js";
import { MODEL } from "../config.js";
import { getOrderTool, listMyOrdersTool } from "../tools/orders.js";
import type { StoreContext } from "../context.js";

export const ordersAgent = new Agent<StoreContext>({
  name: "Orders Agent",
  handoffDescription: "Estado de pedidos, fechas de entrega y transportistas.",
  instructions: ORDER_INTRUCTIONS,
  model: MODEL,
  tools: [getOrderTool, listMyOrdersTool],
});
