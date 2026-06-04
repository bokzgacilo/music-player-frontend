import type { Metadata } from "next";
import "./globals.css";
import { AppStreamProvider } from "@/components/app/app-stream-provider";
import { ClientSessionProvider } from "@/components/auth/client-session-provider";
import { AppShell } from "@/components/layout/app-shell";
import { PlayerProvider } from "@/components/player/player-provider";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Tunes by Bok",
  description: "Open-source web-based music player for educational and testing use",
  icons: {
    icon: "/brand/favicon.png",
    apple: "/brand/apple-icon.png"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <ClientSessionProvider>
          <AppStreamProvider>
            <PlayerProvider>
              <AppShell>{children}</AppShell>
            </PlayerProvider>
          </AppStreamProvider>
        </ClientSessionProvider>
        <Analytics />
      </body>
    </html>
  );
}
