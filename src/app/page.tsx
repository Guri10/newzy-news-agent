import { DigestView } from '@/features/digests/digest-view';
import type { DigestSection } from '@/features/digests/digest-service';
import { getSettings } from '@/features/settings/settings-repository';
import { SettingsPanel } from '@/features/settings/settings-panel';
import { db } from '@/lib/db';

export default async function Home() {
  const [settings, latestDigest] = await Promise.all([
    getSettings(),
    db.digest.findFirst({ orderBy: { createdAt: 'desc' } }),
  ]);
  const sections = Array.isArray(latestDigest?.sections)
    ? (latestDigest.sections as DigestSection[])
    : [];

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Daily briefing</p>
          <h1>Newzy News Agent</h1>
        </div>
        <p className="muted">Geopolitics and sports, fetched on your schedule.</p>
      </header>

      <div className="dashboard-layout">
        <SettingsPanel initialSettings={settings} />
        <DigestView sections={sections} />
      </div>
    </main>
  );
}
