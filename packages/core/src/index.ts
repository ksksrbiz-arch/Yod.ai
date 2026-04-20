// @openyoda/core — shared agent logic
//
// Scaffold for surfaces that all need the same Yoda runtime:
// web, slack-bot, discord-bot, agent-worker, cli.

export interface AgentMessage {
  role: 'user' | 'model' | 'system';
  text: string;
  ts?: number;
}

export interface AgentRequest {
  messages: AgentMessage[];
  userId?: string;
  channel?: 'web' | 'slack' | 'discord' | 'cli' | 'extension' | 'worker';
}

export interface AgentResponse {
  text: string;
  wisdomCard?: { quote: string };
}

export const VERSION = '0.0.1' as const;
