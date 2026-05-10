# BG Accountability - Tenant Web App

Tenant-facing web app for Bridging Gaps accountability workflows.

## Core Features

- Tenant registration and login
- Guided onboarding and achievement stages
- Today execution workspace
- Sales planning, weekly sales logging, and CRM pipeline
- Activity tracking and weekly execution rhythm
- Reports and one-page business profile
- Profile, settings, sessions, and support flows

## Tech Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query

## Local Development

```bash
npm install
npm run dev
```

Default local URL:

```text
http://localhost:8080
```

## Environment

Create a local `.env` file based on `.env.example`.

```text
VITE_API_URL=http://localhost:3002
```

Production/staging may use the Vercel rewrite in `vercel.json` to proxy `/api/v1` requests to the Railway tenant backend.

## Quality Checks

```bash
npm test
npx tsc --noEmit
npm run lint
npm run build
```

## Deployment

The app is deployed through Vercel from the GitHub `main` branch.

Current staging URL:

```text
https://bridge-gaps-dashboard-main.vercel.app
```
