import { describe, expect, it } from 'vitest';
import type { Settings } from '@/features/settings/settings-schema';
import { isScheduleDue } from './time';

const settings: Settings = {
  id: 'default',
  geopoliticsEnabled: true,
  sportsEnabled: true,
  scheduleEnabled: true,
  scheduleTime: '08:00',
  timezone: 'America/Los_Angeles',
};

describe('time helpers', () => {
  it('detects when the configured local schedule minute is due', () => {
    expect(
      isScheduleDue({
        settings,
        now: new Date('2026-06-22T15:00:15Z'),
      }),
    ).toBe(true);
  });

  it('does not run disabled schedules', () => {
    expect(
      isScheduleDue({
        settings: {
          ...settings,
          scheduleEnabled: false,
        },
        now: new Date('2026-06-22T15:00:15Z'),
      }),
    ).toBe(false);
  });
});
