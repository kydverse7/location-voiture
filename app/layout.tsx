import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Location Voiture - Backoffice',
  description: 'SaaS mono-agence pour location de voiture au Maroc'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
