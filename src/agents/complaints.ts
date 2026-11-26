import { Agent } from "@openai/agents";
import { StoreContext } from "../context.js";
import { COMPLAINTS_INSTRUCTIONS } from "../shared/instructions.js";
import { MODEL } from "../config.js";
import { createComplaintTool } from "../tools/complaints.js";
import { RECOMMENDED_PROMPT_PREFIX } from "@openai/agents-core/extensions";
import { askPolicesTool } from "./policies.js";
import { commitmentsGuardrail } from "../guardrails/commitments.js";

export const complaintsAgent = new Agent<StoreContext>({
  name: "Complaints Agent",
  handoffDescription: `Problemas con un pedido: producto dañado,
     incorrecto o que no llegó.`,
  instructions: `${RECOMMENDED_PROMPT_PREFIX}\n${COMPLAINTS_INSTRUCTIONS} `,
  model: MODEL,
  modelSettings: { toolChoice: "required" },
  tools: [createComplaintTool, askPolicesTool],
  outputGuardrails: [commitmentsGuardrail],
});
