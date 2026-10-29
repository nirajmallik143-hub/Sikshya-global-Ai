# Sikshya Global AI — AI Studio app (React + Express)

Source of the Sikshya Global AI app exported from Google AI Studio. It lives in this folder so it does not affect the live Vercel site in the repository root (`index.html` + `api/chat.js`).

Features: multilingual AI coaching (Google Gemini), camera homework scanner, real-time voice, video hub, study alarm, installable PWA.

## Run locally

Prerequisite: Node.js 20+

1. `npm install`
2. Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY` to your own Gemini API key
3. `npm run dev`

You can also paste your own key inside the app (Gemini Key button). It is stored only in the user's browser.

## Security

Never commit API keys. `.env*` files are git-ignored (except `.env.example`). No key is bundled in this source.

## License

MIT — see [LICENSE](../LICENSE). Copyright (c) 2026 Niraj Mallik (Nirajmallik143-hub).
