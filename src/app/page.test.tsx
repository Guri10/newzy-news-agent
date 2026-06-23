import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Settings } from '@/features/settings/settings-schema';
import { DigestView } from '@/features/digests/digest-view';
import { SettingsPanel } from '@/features/settings/settings-panel';

const settings: Settings = {
  id: 'default',
  geopoliticsEnabled: true,
  sportsEnabled: true,
  scheduleEnabled: false,
  scheduleTime: '08:00',
  timezone: 'America/Los_Angeles',
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('dashboard UI', () => {
  it('renders category toggles', () => {
    render(<SettingsPanel initialSettings={settings} />);

    expect(screen.getByLabelText('Geopolitics')).toBeChecked();
    expect(screen.getByLabelText('Sports')).toBeChecked();
  });

  it('saves schedule settings', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      Response.json({
        ...settings,
        scheduleEnabled: true,
        scheduleTime: '17:30',
      }),
    );

    render(<SettingsPanel initialSettings={settings} />);

    fireEvent.click(screen.getByLabelText('Daily schedule'));
    fireEvent.change(screen.getByLabelText('Schedule time'), {
      target: { value: '17:30' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save settings' }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/settings',
        expect.objectContaining({
          method: 'PUT',
        }),
      );
    });

    const [, request] = fetchMock.mock.calls[0];
    expect(JSON.parse(String(request?.body))).toMatchObject({
      scheduleEnabled: true,
      scheduleTime: '17:30',
    });
  });

  it('renders digest sections', () => {
    render(
      <DigestView
        sections={[
          {
            category: 'GEOPOLITICS',
            title: 'Geopolitics',
            articles: [
              {
                title: 'Diplomacy talks resume',
                description: 'Talks resumed today.',
                url: 'https://example.com/geo',
                source: 'example.com',
                publishedAt: '2026-06-22T10:00:00.000Z',
              },
            ],
          },
        ]}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Geopolitics' })).toBeVisible();
    expect(screen.getByText('Diplomacy talks resume')).toBeVisible();
    expect(screen.getByText('example.com')).toBeVisible();
  });
});
