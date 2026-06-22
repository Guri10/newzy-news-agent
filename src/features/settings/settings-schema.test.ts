import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SETTINGS,
  settingsInputSchema,
  settingsSchema,
} from './settings-schema';

describe('settings schema', () => {
  it('provides default settings for the single-user dashboard', () => {
    expect(DEFAULT_SETTINGS).toEqual({
      id: 'default',
      geopoliticsEnabled: true,
      sportsEnabled: true,
      scheduleEnabled: false,
      scheduleTime: '08:00',
      timezone: 'America/Los_Angeles',
    });

    expect(settingsSchema.parse(DEFAULT_SETTINGS)).toEqual(DEFAULT_SETTINGS);
  });

  it('accepts a valid settings update payload', () => {
    const parsed = settingsInputSchema.parse({
      geopoliticsEnabled: false,
      sportsEnabled: true,
      scheduleEnabled: true,
      scheduleTime: '17:30',
      timezone: 'America/New_York',
    });

    expect(parsed.scheduleTime).toBe('17:30');
  });

  it('rejects malformed schedule times', () => {
    expect(() =>
      settingsInputSchema.parse({
        geopoliticsEnabled: true,
        sportsEnabled: true,
        scheduleEnabled: true,
        scheduleTime: '25:99',
        timezone: 'America/Los_Angeles',
      }),
    ).toThrow();
  });
});
