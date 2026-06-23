import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

export default async function globalSetup() {
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  const migrationPath = path.join(
    process.cwd(),
    'prisma',
    'migrations',
    '20260622234000_init',
    'migration.sql',
  );

  mkdirSync(path.dirname(dbPath), { recursive: true });

  const hasSettingsTable =
    existsSync(dbPath) &&
    execFileSync('sqlite3', [dbPath, ".tables Settings"], {
      encoding: 'utf8',
    }).includes('Settings');

  if (!hasSettingsTable) {
    execFileSync('sqlite3', [dbPath, `.read ${migrationPath}`], {
      stdio: 'inherit',
    });
  }
}
