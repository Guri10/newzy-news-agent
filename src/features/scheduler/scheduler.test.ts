import { describe, expect, it, vi } from 'vitest';
import type { Settings } from '@/features/settings/settings-schema';
import { runScheduledFetch } from './scheduler';

const settings: Settings = {
  id: 'default',
  geopoliticsEnabled: true,
  sportsEnabled: true,
  scheduleEnabled: false,
  scheduleTime: '08:00',
  timezone: 'America/Los_Angeles',
};

describe('scheduler', () => {
  it('does not run fetch work when schedule is disabled', async () => {
    const runFetch = vi.fn();

    await runScheduledFetch({
      getSettings: async () => settings,
      runFetch,
      now: new Date('2026-06-22T15:00:00Z'),
    });

    expect(runFetch).not.toHaveBeenCalled();
  });
});
