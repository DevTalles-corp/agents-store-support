import { run } from "@openai/agents";
import { type StoreContext } from "./context.js";
import { triageAgent } from "./agents/triage.js";

const context: StoreContext = { customerId: "C-001", name: "Ana Rojas" };

const scenarios = [
  { message: "¿Dónde está mi pedido 1042?", expected: "Orders Agent" },
  {
    message: "¿Tienen audífonos por menos de 50 dólares?",
    expected: "Products Agent",
  },
  { message: "Mi pedido 1043 llegó roto", expected: "Complaints Agent" },
  { message: "¿El envío es gratis?", expected: "Triage Agent" },
];

let passed = 0;
for (const { message, expected } of scenarios) {
  const result = await run(triageAgent, message, { context, maxTurns: 10 });
  const actual = result.lastAgent?.name;
  const ok =
    actual === expected && String(result.finalOutput ?? "").trim() !== "";
  if (ok) passed++;
  const { requests } = result.state.usage;
  console.log(
    `${ok ? "✅" : "❌"} "${message}" → ${actual} (${requests} llamadas)${ok ? "" : ` esperado: ${expected}`}`,
  );
}
console.log(`\n${passed}/${scenarios.length} escenarios correctos`);
