import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Providers } from './providers';
import { auth } from '@/auth';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'VRIDHIRA - Authentic Indian Handicrafts',
  description: 'A marketplace for local artisans to sell their handcrafted products.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background">
        <Providers session={session}>
          <AuthProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
