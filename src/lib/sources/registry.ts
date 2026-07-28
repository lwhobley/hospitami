import type { SourceAdapter } from "./types";
import { geminiAdapter } from "./gemini-adapter";
import { csvAdapter } from "./csv-adapter";

const adapters = new Map<string, SourceAdapter>();

adapters.set(geminiAdapter.name, geminiAdapter);
adapters.set(csvAdapter.name, csvAdapter);

export function getAdapter(name: string): SourceAdapter | undefined {
  return adapters.get(name);
}

export function listAdapters(): string[] {
  return Array.from(adapters.keys());
}

export function registerAdapter(adapter: SourceAdapter): void {
  adapters.set(adapter.name, adapter);
}
