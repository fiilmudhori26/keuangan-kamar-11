"use client";

import { useCurrentUser } from "@/hooks/use-current-user";
import { logoutAction } from "@/actions/auth";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, User } from "lucide-react";

const roleLabel = {
  pengurus: "Pengurus",
  wali: "Wali Santri",
} as const;

export function Header() {
  const { user } = useCurrentUser();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 glass px-4 sm:px-6">
      <MobileNav />

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <ThemeToggle />

        {user && (
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-teal/10 dark:bg-teal/20 flex items-center justify-center ring-2 ring-teal/20">
                <User className="h-4 w-4 text-teal dark:text-teal" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium leading-none">
                  {user.fullName || user.email}
                </span>
                <Badge
                  variant={user.role === "pengurus" ? "default" : "secondary"}
                  className="mt-1 w-fit text-[10px] px-1.5 py-0 font-medium"
                >
                  {roleLabel[user.role]}
                </Badge>
              </div>
            </div>
          </div>
        )}

        <form action={logoutAction}>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground" type="submit" aria-label="Keluar">
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </header>
  );
}
