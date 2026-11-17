import { Agent } from "@openai/agents";
import { StoreContext } from "../context.js";
import { COMPLAINTS_INSTRUCTIONS } from "../shared/instructions.js";
import { MODEL } from "../config.js";
import { createComplaintTool } from "../tools/complaints.js";

export const complaintsAgent = new Agent<StoreContext>({
  name: "Complaints Agent",
  handoffDescription: `Problemas con un pedido: producto dañado,
     incorrecto o que no llegó.`,
  instructions: COMPLAINTS_INSTRUCTIONS,
  model: MODEL,
  tools: [createComplaintTool],
});
