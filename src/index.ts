import { Agent, run } from "@openai/agents";

const agent = new Agent({
  name: "Store Assistant",
  instructions:
    "Eres el asistente de soporte de una tienda online. Responde en español y en una sola oración. ",
});
const result = await run(agent, "Hola, ¿con quién estoy hablando?");
console.log(result.finalOutput);