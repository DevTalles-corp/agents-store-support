import { SessionInputCallback } from "@openai/agents";

export function lastItems(count: number): SessionInputCallback {
  return (history, newItems) => [...history.slice(-count), ...newItems];
}