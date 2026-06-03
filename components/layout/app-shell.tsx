"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Download, Library, ListMusic, Search, Settings, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlayerBar } from "@/components/player/player-bar";

const nav = [
  { href: "/", label: "Search", icon: Search },
  { href: "/downloads", label: "Downloads", icon: Download },
  { href: "/library", label: "Library", icon: Library },
  { href: "/playlists", label: "Playlists", icon: ListMusic },
  { href: "/recycle-bin", label: "Recycle Bin", icon: Trash2 },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen pb-32">
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r bg-card px-4 py-5 lg:block">
        <Link href="/" className="flex items-center gap-3 rounded-md px-2 py-2">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-primary text-primary-foreground">
            <ListMusic size={21} />
          </span>
          <span>
            <span className="block text-sm font-semibold">Local Music</span>
            <span className="text-xs text-muted-foreground">yt-dlp library</span>
          </span>
        </Link>
        <nav className="mt-8 grid gap-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground", active && "bg-secondary text-secondary-foreground")}>
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <header className="sticky top-0 z-20 border-b bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between">
          <Link href="/" className="font-semibold">Local Music</Link>
          <nav className="flex gap-1">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                  <Icon size={18} />
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="px-4 py-6 sm:px-6 lg:ml-64 lg:px-8">{children}</main>
      <PlayerBar />
    </div>
  );
}
