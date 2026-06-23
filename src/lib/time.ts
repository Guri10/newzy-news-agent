import type { Settings } from '@/features/settings/settings-schema';

function getTimePartsInZone(date: Date, timezone: string) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(date);

  return {
    hour: parts.find((part) => part.type === 'hour')?.value ?? '00',
    minute: parts.find((part) => part.type === 'minute')?.value ?? '00',
  };
}

export function isScheduleDue({
  settings,
  now = new Date(),
}: {
  settings: Settings;
  now?: Date;
}) {
  if (!settings.scheduleEnabled) {
    return false;
  }

  const { hour, minute } = getTimePartsInZone(now, settings.timezone);

  return `${hour}:${minute}` === settings.scheduleTime;
}
