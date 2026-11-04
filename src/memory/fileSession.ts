import { AgentInputItem, Session } from "@openai/agents";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const historyDir = path.join(process.cwd(), "history");

export class FileSession implements Session {
  private readonly filePath: string;
  constructor(private readonly id: string) {
    const safeId = id.replace(/[^a-zA-Z0-9-]/g, "");
    this.filePath = path.join(historyDir, `${safeId}.json`);
  }
  getSessionId(): Promise<string> {
    throw new Error("Method not implemented.");
  }
  getItems(limit?: number): Promise<AgentInputItem[]> {
    throw new Error("Method not implemented.");
  }
  addItems(items: AgentInputItem[]): Promise<void> {
    throw new Error("Method not implemented.");
  }
  popItem(): Promise<AgentInputItem | undefined> {
    throw new Error("Method not implemented.");
  }
  clearSession(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  private async read(): Promise<AgentInputItem[]> {
    try {
      return JSON.parse(await readFile(this.filePath, "utf8"));
    } catch {
      return [];
    }
  }
  private async save(items: AgentInputItem): Promise<void> {
    await mkdir(historyDir, { recursive: true });
    await writeFile(this.filePath, JSON.stringify(items, null, 2));
  }
}
