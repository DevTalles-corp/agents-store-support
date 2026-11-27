import { Agent, OutputGuardrail, run } from "@openai/agents";
import z from "zod";
import { MODEL } from "../config.js";

const commitmentsReviewer = new Agent({
  name: "Commitments Reviewer",
  instructions: `Revisas la respuesta de un agente de soporte.
Marca improperCommitment = true si promete descuentos, cupones, regalos
o compensaciones que no sean el reembolso del monto pagado.`,
  model: MODEL,
  outputType: z.object({
    improperCommitment: z.boolean(),
    phrase: z.string().nullable(),
  }),
});

export const commitmentsGuardrail: OutputGuardrail = {
  name: "Commitments Guardarial",
  execute: async ({ agentOutput, context }) => {
    const result = await run(commitmentsReviewer, String(agentOutput), {
      context,
    });
    return {
      tripwireTriggered: result.finalOutput?.improperCommitment ?? false,
      outputInfo: result.finalOutput,
    };
  },
};