import { Preferences } from '@capacitor/preferences';
import { PROVIDERS } from './api.js';

const KEY = 'multi_ai_chat_settings';

// Built from the provider list so a new provider gets its key/model fields automatically.
const DEFAULTS = {
  tavilyKey: '',
  activeProvider: 'groq',
  useTavily: false
};
for (const p of Object.values(PROVIDERS)) {
  DEFAULTS[p.keyField] = '';
  DEFAULTS[p.modelField] = p.defaultModel;
}

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
