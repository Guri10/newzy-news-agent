import { z } from 'zod';

const scheduleTimeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, {
  message: 'Schedule time must use HH:mm in 24-hour time.',
});

export const settingsSchema = z.object({
  id: z.literal('default'),
  geopoliticsEnabled: z.boolean(),
  sportsEnabled: z.boolean(),
  scheduleEnabled: z.boolean(),
  scheduleTime: scheduleTimeSchema,
  timezone: z.string().min(1),
});

export const settingsInputSchema = settingsSchema.omit({ id: true });

export type Settings = z.infer<typeof settingsSchema>;
export type SettingsInput = z.infer<typeof settingsInputSchema>;

export const DEFAULT_SETTINGS: Settings = {
  id: 'default',
  geopoliticsEnabled: true,
  sportsEnabled: true,
  scheduleEnabled: false,
  scheduleTime: '08:00',
  timezone: 'America/Los_Angeles',
};
