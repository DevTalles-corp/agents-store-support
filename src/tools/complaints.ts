import { type RunContext, tool } from "@openai/agents";
import type { StoreContext } from "../context.js";
import z from "zod";
import { findOrder, saveComplaint } from "../data/store.js";
import { compaction } from "@openai/agents/sandbox";

export const createComplaintTool = tool({
  name: "create_complaint",
  description: `Registra un reclamo sobre un pedido del cliente actual 
  y devuelve el número de caso.`,
  parameters: z.object({
    orderNumber: z.string().describe("Número de pedido afectado"),
    reason: z.enum([
      "damaged_product",
      "wrong_product",
      "not_delivered",
      "other",
    ]),
    details: z
      .string()
      .describe("Descripción breve del problema con las palabras del cliente"),
  }),
  execute: async (
    { orderNumber, reason, details },
    runContext?: RunContext<StoreContext>,
  ) => {
    const customerId = runContext?.context.customerId ?? "";
    const order = await findOrder(orderNumber);
    if (!order || order.customerId !== customerId) {
      return `No encontré el pedido: ${orderNumber} entre los pedidos de este cliente.`;
    }
    const complaint = await saveComplaint({
      customerId,
      orderNumber,
      reason,
      details,
    });
    return {
      complaintId: complaint.id,
      status: complaint.status,
      orderTotal: order.total,
    };
  },
});
