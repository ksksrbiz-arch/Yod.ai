<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# OpenYoda

> Wisdom, distilled. The premium AI wisdom platform.

A monorepo housing every surface of Yoda.ai — the web app, bots, browser
extensions, CLI, agent runtime, and the SDKs and shared packages that power
them all.

## Workspaces

```
openyoda/
├── apps/
│   ├── web/                    Next.js wisdom platform (Phase 1)
│   ├── slack-bot/              Yoda in Slack
│   ├── discord-bot/            Yoda in Discord
│   ├── chrome-extension/       Wisdom on every page
│   ├── cli/                    npx openyoda
│   └── agent-worker/           24/7 agent runtime
├── packages/
│   ├── core/                   Shared agent logic
│   ├── prompts/                Versioned Yoda prompts
│   ├── ui/                     Shared design-system components
│   ├── mcp-server/             @openyoda/mcp-server
│   ├── mcp-client/             Outbound MCP orchestration
│   ├── sdk-js/                 @openyoda/sdk
│   └── sdk-python/             openyoda (PyPI)
├── infra/
│   ├── supabase/migrations/
│   └── stripe/
├── turbo.json
└── package.json                workspace root
```

## Getting started

```bash
npm install
npm run dev                   # all apps in parallel via turbo
npm run dev -- --filter=web   # just the web app
```

Or run the web app standalone:

```bash
cd apps/web
npm install
npm run dev
```

### Environment

Each app owns its own `.env.example`. The web app needs at minimum:

```
GEMINI_API_KEY="..."
APP_URL="http://localhost:3000"
```

## License

MIT — see [LICENSE](./LICENSE). Copyright © 1Commerce LLC.

Hosted infrastructure code (billing, agent orchestration, enterprise
connectors) lives in a separate private repository and is **not** covered by
this license.

---

View the original AI Studio app: https://ai.studio/apps/15a4a006-7024-4cb8-94b9-8c6822441f3c
