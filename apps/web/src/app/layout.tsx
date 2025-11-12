import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PayMesh Dashboard',
  description: 'Payments + escrow + reputation coordination for MCP agents.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
