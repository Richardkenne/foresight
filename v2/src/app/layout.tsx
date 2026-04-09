import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Foresight — Life & Career Decision Engine",
  description: "See the outcome of any life or career decision before you make it. Real data, zero guesswork.",
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: "Foresight",
    description: "See the outcome of any life or career decision before you make it.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} h-full`}>
      <body className="h-full overflow-hidden font-[var(--font-geist-sans)] antialiased">{children}</body>
    </html>
  );
}
