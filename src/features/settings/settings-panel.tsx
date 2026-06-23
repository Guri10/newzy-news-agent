'use client';

import { useState } from 'react';
import type { Settings, SettingsInput } from './settings-schema';

type SettingsPanelProps = {
  initialSettings: Settings;
};

export function SettingsPanel({ initialSettings }: SettingsPanelProps) {
  const [settings, setSettings] = useState<SettingsInput>({
    geopoliticsEnabled: initialSettings.geopoliticsEnabled,
    sportsEnabled: initialSettings.sportsEnabled,
    scheduleEnabled: initialSettings.scheduleEnabled,
    scheduleTime: initialSettings.scheduleTime,
    timezone: initialSettings.timezone,
  });
  const [status, setStatus] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  async function saveSettings() {
    setIsSaving(true);
    setStatus('');

    const response = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });

    setIsSaving(false);
    setStatus(response.ok ? 'Settings saved' : 'Unable to save settings');
  }

  async function fetchNow() {
    setIsFetching(true);
    setStatus('');

    const response = await fetch('/api/fetch-now', {
      method: 'POST',
    });

    setIsFetching(false);
    setStatus(response.ok ? 'Digest refreshed' : 'Unable to refresh digest');
  }

  return (
    <section className="dashboard-panel" aria-labelledby="settings-heading">
      <div className="panel-header">
        <h2 id="settings-heading">Settings</h2>
        <button type="button" onClick={fetchNow} disabled={isFetching}>
          {isFetching ? 'Fetching...' : 'Fetch now'}
        </button>
      </div>

      <div className="control-grid">
        <label>
          <input
            type="checkbox"
            checked={settings.geopoliticsEnabled}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                geopoliticsEnabled: event.target.checked,
              }))
            }
          />
          Geopolitics
        </label>

        <label>
          <input
            type="checkbox"
            checked={settings.sportsEnabled}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                sportsEnabled: event.target.checked,
              }))
            }
          />
          Sports
        </label>

        <label>
          <input
            type="checkbox"
            checked={settings.scheduleEnabled}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                scheduleEnabled: event.target.checked,
              }))
            }
          />
          Daily schedule
        </label>

        <label>
          Schedule time
          <input
            type="time"
            value={settings.scheduleTime}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                scheduleTime: event.target.value,
              }))
            }
          />
        </label>

        <label>
          Timezone
          <input
            type="text"
            value={settings.timezone}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                timezone: event.target.value,
              }))
            }
          />
        </label>
      </div>

      <div className="settings-actions">
        <button type="button" onClick={saveSettings} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save settings'}
        </button>
        {status ? <p role="status">{status}</p> : null}
      </div>
    </section>
  );
}
