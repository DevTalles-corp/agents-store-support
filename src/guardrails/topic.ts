import { Agent, InputGuardrail, run } from "@openai/agents";
import { MODEL } from "../config.js";
import z from "zod";

const topicClassifier = new Agent({
  name: "Topic Classifier",
  instructions: `Decides si el último mensaje del cliente tiene que ver con una tienda online:
  pedidos, productos, envíos, devoluciones, garantía, reclamos, pagos o un saludo.
  Cualquier otra cosa (tareas escolares, programación, política, etc.) está fuera de tema.`,
  model: MODEL,
  outputType: z.object({
    offTopic: z.boolean(),
    reason: z.string(),
  }),
});

export const topicGuardrail: InputGuardrail = {
  name: "Topic Guardrail",
  runInParallel: false,
  execute: async ({ input, context }) => {
    const result = await run(topicClassifier, input, { context });
    return {
      tripwireTriggered: result.finalOutput?.offTopic ?? false,
      outputInfo: result.finalOutput,
    };
  },
};
