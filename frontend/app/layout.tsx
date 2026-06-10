// Root Layout — Incubein Analytics Dashboard
// Wraps the entire application with fonts, global styles, and providers
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

/* ─── Font Configuration ──────────────────────────────────────────── */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

/* ─── SEO Metadata ────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: "Incubein Analytics Dashboard",
  description:
    "A unified analytics dashboard for YouTube, LinkedIn, and Meta platforms. Schedule, analyze, and grow your social presence.",
};

/* ─── Root Layout Component ───────────────────────────────────────── */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // dark class applied by default for dark-mode-native experience
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
