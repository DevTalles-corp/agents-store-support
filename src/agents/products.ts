import { Agent } from "@openai/agents";
import { StoreContext } from "../context.js";
import { PRODUCTS_INSTRUCTIONS } from "../shared/instructions.js";
import { MODEL } from "../config.js";
import { getProductTool, searchProductsTool } from "../tools/products.js";
import { RECOMMENDED_PROMPT_PREFIX } from "@openai/agents-core/extensions";

export const productsAgent = new Agent<StoreContext>({
  name: "Products Agent",
  handoffDescription:
    "Dudas sobre el catálogo: productos, precios, características y stock.",
  instructions: `${RECOMMENDED_PROMPT_PREFIX}\n${PRODUCTS_INSTRUCTIONS}`,
  model: MODEL,
  modelSettings: { toolChoice: "required" },
  tools: [searchProductsTool, getProductTool],
});
