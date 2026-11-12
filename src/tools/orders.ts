import { type RunContext, tool } from "@openai/agents";
import { z } from "zod";
import { filterProducts, findOrder, getCustomerOrders } from "../data/store.js";
import { StoreContext } from "../context.js";

export const getOrderTool = tool({
  name: "get_order",
  description:
    "Devuelve el estado, la fecha estimada de entrega y el transportista de un pedido. ",
  parameters: z.object({
    orderNumber: z.string().describe('Número de pedido, por ejemplo: "1042".'),
  }),
  execute: async ({ orderNumber }, runContext?: RunContext<StoreContext>) => {
    const customerId = runContext?.context.customerId;
    const order = await findOrder(orderNumber);
    if (!order || order.customerId !== customerId) {
      return `No encontré el pedido: "${orderNumber}" entre los pedidos de este cliente.`;
    }

    return {
      number: order.number,
      status: order.status,
      estimatedDelivery: order.estimatedDelivery,
      carrier: order.carrier,
      total: order.total,
    };
  },
  errorFunction: (_runContext, _error) => {
    return `No pude consultar los pedidos en este momento.
     Pide al cliente que intente más tarde. `;
  },
});

export const listMyOrdersTool = tool({
  name: "list_my_orders",
  description:
    "Lista los pedidos del cliente actual con su estado. Úsala si el cliente no recuerda el número.",
  parameters: z.object({}),
  execute: async (_input, runContext?: RunContext<StoreContext>) => {
    const customerId = runContext?.context.customerId ?? "";
    const orders = await getCustomerOrders(customerId);
    return orders.map((o) => ({
      number: o.number,
      status: o.status,
      purchaseDate: o.purchaseDate,
    }));
  },
});
