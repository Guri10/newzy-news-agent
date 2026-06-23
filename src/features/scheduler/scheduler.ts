import cron, { type ScheduledTask } from 'node-cron';
import type { Settings } from '@/features/settings/settings-schema';
import { isScheduleDue } from '@/lib/time';

type SchedulerDependencies = {
  getSettings: () => Promise<Settings>;
  runFetch: () => Promise<void>;
  now?: Date;
};

export async function runScheduledFetch({
  getSettings,
  runFetch,
  now = new Date(),
}: SchedulerDependencies) {
  const settings = await getSettings();

  if (!isScheduleDue({ settings, now })) {
    return false;
  }

  await runFetch();
  return true;
}

export function startDailyScheduler({
  getSettings,
  runFetch,
}: Omit<SchedulerDependencies, 'now'>): ScheduledTask {
  return cron.schedule('* * * * *', () => {
    void runScheduledFetch({ getSettings, runFetch });
  });
}
