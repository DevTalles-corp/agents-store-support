import { Agent, run } from "@openai/agents";
import { MODEL } from "./config.js";

const agent = new Agent({
  name: "Store Assistant",
  instructions: `Eres el asistente de soporte de una tienda online.
     Responde en español en dos o tres frases con un tono cercano .
     Si no sabes algo, lo dices: nunca inventas datos. `,
  model: MODEL,
  modelSettings: {
    text: { verbosity: "low" },
  },
});
const result = await run(agent, "Hola, ¿con quién estoy hablando?");
console.log("Respuesta: ", result.finalOutput);
console.log("Agente: ", result.lastAgent?.name);
console.log(
  "Pasos: ",
  result.newItems.map((item) => item.type),
);
console.log("Historial: ", result.history.length, "elementos");
console.log("Uso: ", result.state.usage);
