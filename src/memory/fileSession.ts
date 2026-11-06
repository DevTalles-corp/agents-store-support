import { AgentInputItem, Session } from "@openai/agents";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const historyDir = path.join(process.cwd(), "history");

export class FileSession implements Session {
  private readonly filePath: string;
  constructor(private readonly id: string) {
    const safeId = id.replace(/[^a-zA-Z0-9-]/g, "");
    this.filePath = path.join(historyDir, `${safeId}.json`);
  }
  async getSessionId(): Promise<string> {
    return this.id;
  }
  async getItems(limit?: number): Promise<AgentInputItem[]> {
    const items = await this.read();
    return limit ? items.slice(-limit) : items;
  }
  async addItems(items: AgentInputItem[]): Promise<void> {
    const current = await this.read();
    await this.save([...current, ...items]);
  }
  async popItem(): Promise<AgentInputItem | undefined> {
    const items = await this.read();
    const last = items.pop();
    await this.save(items);
    return last;
  }
  async clearSession(): Promise<void> {
    await rm(this.filePath, { force: true });
  }

  private async read(): Promise<AgentInputItem[]> {
    try {
      return JSON.parse(await readFile(this.filePath, "utf8"));
    } catch {
      return [];
    }
  }
  private async save(items: AgentInputItem[]): Promise<void> {
    await mkdir(historyDir, { recursive: true });
    await writeFile(this.filePath, JSON.stringify(items, null, 2));
  }
}