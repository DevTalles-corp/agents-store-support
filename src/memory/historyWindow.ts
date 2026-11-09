import { AgentInputItem, SessionInputCallback } from "@openai/agents";

const isUserMessage = (item: AgentInputItem) =>
  "role" in item && item.role === "user";

export function lastItems(count: number): SessionInputCallback {
  return (history, newItems) => {
    let window = history.slice(-count);
    const firstUser = window.findIndex(isUserMessage);
    window = firstUser === -1 ? [] : window.slice(firstUser);
    return [...window, ...newItems];
  };
}
