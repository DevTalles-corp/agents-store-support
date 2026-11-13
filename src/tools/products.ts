import { z } from "zod";
import { filterProducts, findProduct } from "../data/store.js";
import { tool } from "@openai/agents";

export const searchProductsTool = tool({
  name: "search_products",
  description:
    "Busca productos del catálogo por texto, categoría y precio máximo.",
  parameters: z.object({
    text: z
      .string()
      .nullable()
      .describe("Palabras a buscar en el nombre o la descripción."),
    category: z
      .enum(["audio", "accessories", "wearables"])
      .nullable()
      .describe("Categoría del catálogo."),
    maxPrice: z
      .number()
      .positive()
      .nullable()
      .describe("Precio máximo en dólares."),
    inStockOnly: z
      .boolean()
      .describe("true para mostrar solo productos disponibles."),
  }),
  execute: async (filter) => {
    const products = await filterProducts(filter);
    if (products.length === 0)
      return `No hay productos que coincidan con la búsqueda.`;
    return products.map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
    }));
  },
});

export const getProductTool = tool({
  name: "get_product",
  description: `Devuelve la ficha completa de un producto
     por su ID, incluida la descripción y el stock. `,
  parameters: z.object({
    id: z.string().describe('ID del producto, por ejemplo: "P-101"'),
  }),
  execute: async ({ id }) => {
    const product = await findProduct(id);
    return product ?? `No existe un producto con id ${id} `;
  },
});