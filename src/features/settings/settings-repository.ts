import { db } from '@/lib/db';
import {
  DEFAULT_SETTINGS,
  type Settings,
  type SettingsInput,
  settingsInputSchema,
  settingsSchema,
} from './settings-schema';

function toSettings(settings: unknown): Settings {
  return settingsSchema.parse(settings);
}

export async function getSettings(): Promise<Settings> {
  const settings = await db.settings.upsert({
    where: { id: DEFAULT_SETTINGS.id },
    create: DEFAULT_SETTINGS,
    update: {},
  });

  return toSettings(settings);
}

export async function updateSettings(input: SettingsInput): Promise<Settings> {
  const parsedInput = settingsInputSchema.parse(input);
  const settings = await db.settings.upsert({
    where: { id: DEFAULT_SETTINGS.id },
    create: {
      ...DEFAULT_SETTINGS,
      ...parsedInput,
    },
    update: parsedInput,
  });

  return toSettings(settings);
}
