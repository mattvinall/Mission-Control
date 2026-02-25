import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '🐉 Hydra Mission Control',
  description: 'Mission Control dashboard for Pipeline Labs - Track projects, tasks, and progress toward $10M ARR',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-950 text-gray-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}