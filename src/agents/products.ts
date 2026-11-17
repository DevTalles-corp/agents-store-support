import { Agent } from "@openai/agents";
import { StoreContext } from "../context.js";
import { PRODUCTS_INSTRUCTIONS } from "../shared/instructions.js";
import { MODEL } from "../config.js";
import { getProductTool, searchProductsTool } from "../tools/products.js";

export const productsAgent = new Agent<StoreContext>({
  name: "Products Agent",
  handoffDescription:
    "Dudas sobre el catálogo: productos, precios, características y stock.",
  instructions: PRODUCTS_INSTRUCTIONS,
  model: MODEL,
  tools: [searchProductsTool, getProductTool],
});
