# Nexus -- Multi AI Chat

A free Android chat app powered by Groq, OpenRouter, and Pollinations.ai.
Supports AI chat with web search and AI image generation.
API keys are stored on-device only. No backend, no accounts required.

---

## Features

- AI Chat via Groq or OpenRouter (your choice per session)
- Web search via Tavily injected into AI context before each reply
- AI Image Generation via Pollinations.ai Flux (free, no key needed)
- Markdown rendering in chat responses
- Copy and Share buttons on every AI reply
- Copy button on every code block in AI responses
- Chat history persists while the app is open; clears on exit
- All API keys stored locally on your device

---

## Getting the App

Download the latest signed APK from the GitHub Actions artifacts:

1. Go to: https://github.com/Roo0722/multi-ai-chat/actions
2. Open the most recent successful "Build Android APK" run.
3. Scroll down to Artifacts and tap `nexus-signed-release-apk`.
4. Extract the downloaded zip file.
5. Install `app-release.apk` on your Android device.
   - If prompted, enable "Install from unknown sources" for your file manager.

---

## First-Time Setup

1. Open the app and tap **Settings** (bottom right tab).
2. Set your **Active Provider** to Groq or OpenRouter.
3. Enter your API key(s) for the provider(s) you want to use.
4. Tap the **Test** button next to each key to verify it works.
5. Switch to the **Chat** tab and start chatting.

---

## How to Obtain API Keys

### Groq (fast, free tier available)

1. Go to: https://console.groq.com
2. Sign up for a free account.
3. Navigate to API Keys in the left sidebar.
4. Click "Create API Key" and copy the key (starts with `gsk_`).
5. Paste it into the Groq API Key field in Nexus Settings.

Recommended free models to enter in the Groq Model field:
- `llama-3.3-70b-versatile` (default, best general use)
- `llama-3.1-8b-instant` (faster, lighter)
- `gemma2-9b-it` (good for reasoning)

---

### OpenRouter (access to hundreds of models)

1. Go to: https://openrouter.ai
2. Sign up for a free account.
3. Go to Keys at: https://openrouter.ai/keys
4. Click "Create Key" and copy it (starts with `sk-or-`).
5. Paste it into the OpenRouter API Key field in Nexus Settings.

Example models to enter in the OpenRouter Model field:
- `openai/gpt-4o-mini` (affordable, capable)
- `anthropic/claude-3.5-haiku` (fast, great for chat)
- `google/gemini-flash-1.5` (good multimodal)
- `meta-llama/llama-3.3-70b-instruct` (free tier available)

Full model list: https://openrouter.ai/models

---

### Tavily (web search, optional)

Tavily lets the AI search the web before answering your question.
Useful for current events, research, and fact-checking.

1. Go to: https://tavily.com
2. Sign up for a free account (1,000 free searches/month).
3. Copy your API key from the dashboard (starts with `tvly-`).
4. Paste it into the Tavily API Key field in Nexus Settings.
5. Enable the "Use Tavily web search" toggle in Settings.

---

### Image Generation (Pollinations.ai)

No API key needed. Image generation works out of the box.
Switch to the **Image** tab, type a prompt, and tap Generate.

---

## Tab Overview

| Tab | What it does |
|---|---|
| Chat | AI conversation with your chosen provider and model |
| Image | AI image generation via Pollinations.ai Flux |
| Settings | Configure API keys, models, provider, and Tavily toggle |

---

## Settings Reference

| Field | Required | Notes |
|---|---|---|
| Active Provider | Yes | Groq or OpenRouter |
| Groq API Key | If using Groq | Starts with `gsk_` |
| Groq Model | If using Groq | Text field, see suggestions above |
| OpenRouter API Key | If using OpenRouter | Starts with `sk-or-` |
| OpenRouter Model | If using OpenRouter | Text field, see suggestions above |
| Tavily API Key | Optional | Enables web search in Chat |
| Use Tavily toggle | Optional | Must be on for search to run |

---

## Building from Source

No local Android Studio required. Builds run entirely on GitHub Actions.

```
# Install dependencies
npm install

# Run locally in browser
npm run dev

# Build and sync (requires Android platform added)
npm run build
npx cap sync android
```

Every push to `main` triggers an automatic signed APK build via GitHub Actions.

---

## Tech Stack

- React + Vite (frontend)
- Capacitor 6 (Android wrapper)
- @capacitor/preferences (on-device key storage)
- @capacitor/share (native Android share sheet)
- react-markdown (chat response rendering)
- lucide-react (icons)
- Groq API (OpenAI-compatible chat completions)
- OpenRouter API (OpenAI-compatible, multi-model gateway)
- Tavily API (web search)
- Pollinations.ai (free image generation, no key)

---

## License

Personal use. Not affiliated with Groq, OpenRouter, Tavily, or Pollinations.ai.
