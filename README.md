# Multi AI Chat

Android chat app (Capacitor + React) supporting Groq, OpenRouter, and Tavily,
with API keys and model selection configured in-app under Settings.

## Status

Step 1 of the build plan: project scaffold and placeholder UI only.
No API calls are wired up yet. Settings fields do not yet persist.

## Local development

```
npm install
npm run dev
```

## Building the Android APK (via GitHub Actions, no local Android Studio needed)

A workflow will be added in a later step to mirror the hok-camp-android and
hok-database-app pipelines: install deps, `npm run build`, `npx cap sync android`,
then assemble the debug APK with Gradle inside the Actions runner.
