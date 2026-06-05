"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Download, Library, ListMusic, LogOut, Search, Settings, Shield, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useClientSession } from "@/components/auth/client-session-provider";
import { PlayerBar } from "@/components/player/player-bar";

const clientNav = [
  { href: "/", label: "Search", icon: Search },
  { href: "/downloads", label: "Downloads", icon: Download },
  { href: "/library", label: "Library", icon: Library },
  { href: "/playlists", label: "Playlists", icon: ListMusic }
];

const controlPanelNav = [
  { href: "/control-panel/users", label: "Users", icon: Users },
  { href: "/control-panel/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { signOut } = useClientSession();
  return (
    <div className="min-h-screen pb-32">
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r bg-card px-4 py-5 lg:block">
        <Link href="/" className="flex items-center gap-3 rounded-md px-2 py-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/tunes-by-bok-icon.png" alt="" className="" />
          {/* <span>
            <span className="block text-sm font-semibold">Tunes by Bok</span>
            <span className="text-xs text-muted-foreground">Open-source web player</span>
          </span> */}
        </Link>
        <nav className="mt-8 grid gap-1">
          {clientNav.map((item) => {
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
        <div className="mt-8 border-t pt-4">
          <div className="mb-2 flex items-center gap-2 px-3 text-xs font-medium uppercase text-muted-foreground">
            <Shield size={14} />
            Control Panel
          </div>
          <nav className="grid gap-1">
            {controlPanelNav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground", active && "bg-secondary text-secondary-foreground")}>
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="absolute bottom-28 left-4 right-4 grid gap-2 border-t pt-4 text-xs text-muted-foreground">
          <Button type="button" variant="outline" size="sm" className="justify-start" onClick={() => signOut()}>
            <LogOut size={16} />
            Sign out
          </Button>
          <Link href="/privacy-policy" className="rounded-md px-3 py-1.5 hover:bg-muted hover:text-foreground">Privacy Policy</Link>
          <Link href="/terms-and-conditions" className="rounded-md px-3 py-1.5 hover:bg-muted hover:text-foreground">Terms and Conditions</Link>
        </div>
      </aside>
      <header className="sticky top-0 z-20 border-b bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/tunes-by-bok-icon.png" alt="" className="h-8 w-8 rounded-md object-cover" />
            Tunes by Bok
          </Link>
          <nav className="flex gap-1">
            {[...clientNav, ...controlPanelNav].map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                  <Icon size={18} />
                </Link>
              );
            })}
            <Link href="/privacy-policy" className="rounded-md px-2 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">Privacy</Link>
            <Link href="/terms-and-conditions" className="rounded-md px-2 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">Terms</Link>
            <Button type="button" variant="ghost" size="iconSm" onClick={() => signOut()} aria-label="Sign out">
              <LogOut size={18} />
            </Button>
          </nav>
        </div>
      </header>
      <main className="px-4 py-6 sm:px-6 lg:ml-64 lg:px-8">{children}</main>
      <PlayerBar />
    </div>
  );
}
