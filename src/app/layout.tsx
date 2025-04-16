import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'TripTailor',
  description: 'AI Powered Trip Planner',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="google-maps-background" />
        <div className="relative min-h-screen">
          <header className="bg-secondary/80 backdrop-blur-sm sticky top-0 z-50 py-4 shadow-md">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-2xl font-semibold text-foreground">TripTailor</h1>
            </div>
          </header>
          <main>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
