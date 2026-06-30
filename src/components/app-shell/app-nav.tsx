import Link from "next/link";
import { BookOpen, CalendarClock, Gauge, Lock, Settings, Trophy, UserRound } from "lucide-react";
import { BrandIcon } from "@/components/brand/brand-icon";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/sheets", label: "Sheets", icon: BookOpen },
  { href: "/revisions", label: "Revisions", icon: CalendarClock, locked: true },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy, locked: true },
  { href: "/profile/me", label: "Profile", icon: UserRound },
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavLinks() {
  return (
    <nav className="grid gap-1">
      {links.map((item) => (
        item.locked ? (
          <span
            key={item.href}
            aria-disabled="true"
            className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground/55"
          >
            <item.icon className="size-4" />
            <span className="min-w-0 flex-1">{item.label}</span>
            <Lock className="size-3.5" />
          </span>
        ) : (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        )
      ))}
    </nav>
  );
}

export function AppNav() {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r bg-background/90 p-4 backdrop-blur lg:block">
        <Link href="/" className="mb-8 flex items-center gap-2 px-2 text-lg font-semibold">
          <BrandIcon priority />
          DSA Tracker
        </Link>
        <NavLinks />
      </aside>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/90 px-4 backdrop-blur lg:hidden">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <BrandIcon className="size-7 rounded-[9px]" />
          DSA Tracker
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">Menu</Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>DSA Tracker</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <NavLinks />
            </div>
          </SheetContent>
        </Sheet>
      </header>
    </>
  );
}
