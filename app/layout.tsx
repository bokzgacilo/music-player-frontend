import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { PlayerProvider } from "@/components/player/player-provider";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Local Music App",
  description: "Local yt-dlp music library"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <PlayerProvider>
          <AppShell>{children}</AppShell>
        </PlayerProvider>
        <Analytics />
      </body>
    </html>
  );
}
