import { AgentInputItem, InputGuardrail } from "@openai/agents";

// 13 a 19 dígitos, opcionalmente separados por espacios o guiones, en cualquier parte del texto.
const CARD_PATTERN = /\b(?:\d[ -]?){12,18}\d\b/g;

// Algoritmo de Luhn: evita falsos positivos con números de pedido, teléfonos, etc.
function passesLuhn(digits: string): boolean {
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

function containsCardNumber(text: string): boolean {
  for (const match of text.matchAll(CARD_PATTERN)) {
    const digits = match[0].replace(/\D/g, "");
    if (digits.length >= 13 && digits.length <= 19 && passesLuhn(digits)) {
      return true;
    }
  }
  return false;
}

function lastUserText(input: string | AgentInputItem[]): string {
  if (typeof input === "string") return input;
  for (let index = input.length - 1; index >= 0; index--) {
    const item = input[index];
    if (item.type === "message" && item.role === "user") {
      if (typeof item.content === "string") return item.content;
      return item.content
        .map((part) => (part.type === "input_text" ? part.text : ""))
        .join(" ");
    }
  }
  return "";
}

export const cardNumberGuardrail: InputGuardrail = {
  name: "Card Number Guardrail",
  runInParallel: false,
  execute: async ({ input }) => {
    const triggered = containsCardNumber(lastUserText(input));
    return {
      tripwireTriggered: triggered,
      outputInfo: { reason: triggered ? "posible número de tarjeta" : null },
    };
  },
};
