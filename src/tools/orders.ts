import { tool } from "@openai/agents";
import { z } from "zod";
import { findOrder } from "../data/store.js";

export const getOrderTool = tool({
  name: "get_order",
  description:
    "Devuelve el estado, la fecha estimada de entrega y el transportista de un pedido. ",
  parameters: z.object({
    orderNumber: z.string().describe('Número de pedido, por ejemplo: "1042".'),
  }),
  execute: async ({ orderNumber }) => {
    const order = await findOrder(orderNumber);
    if (!order)
      return `No encontré el pedido: ${orderNumber}. 
    Pide al cliente que revise el número en su correo de confirmación. `;
    return {
      number: order.number,
      status: order.status,
      estimatedDelivery: order.estimatedDelivery,
      carrier: order.carrier,
      total: order.total,
    };
  },
});
