// @openyoda/sdk — Official JavaScript/TypeScript SDK
//
// Scaffold. Will provide a minimal client for the public Yoda.ai API:
//
//   import { Yoda } from '@openyoda/sdk';
//   const yoda = new Yoda({ apiKey });
//   const { text } = await yoda.ask('should I take the offer?');

export interface YodaOptions {
  apiKey: string;
  baseUrl?: string;
}

export class Yoda {
  constructor(public readonly options: YodaOptions) {}

  async ask(_question: string): Promise<{ text: string }> {
    throw new Error('Not implemented yet — scaffold.');
  }
}

export const VERSION = '0.0.1' as const;
