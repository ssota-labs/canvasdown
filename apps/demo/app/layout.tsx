import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Canvasdown Examples - Next.js',
  description: 'Canvasdown DSL examples with Next.js and shadcn/ui',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
