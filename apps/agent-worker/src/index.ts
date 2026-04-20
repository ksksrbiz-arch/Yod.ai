// @openyoda/agent-worker — entry point
//
// Scaffold. Will run scheduled jobs (daily wisdom push, reflection prompts)
// and act as the long-running agent runtime that consumes @openyoda/core
// and orchestrates outbound MCP tools via @openyoda/mcp-client.

export const status = 'scaffold' as const;
