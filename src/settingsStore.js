import { Preferences } from '@capacitor/preferences';

const KEY = 'multi_ai_chat_settings';

const DEFAULTS = {
  groqKey: '',
  openRouterKey: '',
  tavilyKey: '',
  groqModel: 'llama-3.3-70b-versatile',
  openRouterModel: 'openai/gpt-4o-mini',
  activeProvider: 'groq',
  useTavily: false
};

export async function loadSettings() {
  const { value } = await Preferences.get({ key: KEY });
  if (!value) return { ...DEFAULTS };
  try {
    return { ...DEFAULTS, ...JSON.parse(value) };
  } catch {
    return { ...DEFAULTS };
  }
}

export async function saveSettings(settings) {
  await Preferences.set({ key: KEY, value: JSON.stringify(settings) });
}
