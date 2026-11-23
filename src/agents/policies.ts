import { Agent } from "@openai/agents";
import { readPolices } from "../data/store.js";
import { MODEL } from "../config.js";

const policiesAgent = new Agent({
  name: "Policies Agent",
  instructions: async () =>
    `
    Responde preguntas sobre las políticas de la tienda usando solo este documento.
    Si la respuesta no está en el documento, dile. 
    ${await readPolices()}
    `,
  model: MODEL,
});

export const askPolicesTool = policiesAgent.asTool({
  toolName: "ask_policies",
  toolDescription: `
    Responde dudas sobre envíos, devoluciones y garantías según las políticas oficiales. 
    `,
});
