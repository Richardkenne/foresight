import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Simulator — Life & Business Scenario Simulator",
  description: "Simulate any life or business scenario with real data. See who makes it and who doesn't.",
  icons: { icon: '/favicon.svg' },
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
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="h-full overflow-hidden font-[var(--font-inter)] antialiased">{children}</body>
    </html>
  );
}
