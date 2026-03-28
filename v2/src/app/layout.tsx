import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Simulator — Life & Business Scenario Simulator",
  description: "Simulate any life or business scenario with real data. See who makes it and who doesn't.",
  icons: { icon: '/favicon.svg' },
  viewport: { width: 'device-width', initialScale: 1, maximumScale: 1 },
  openGraph: {
    title: "Simulator",
    description: "Simulate any life or business scenario with real data.",
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
