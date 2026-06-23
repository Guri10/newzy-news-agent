import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Newzy News Agent',
  description: 'Daily geopolitical and sports news briefing',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
