"use client";

import { useCurrentUser } from "@/hooks/use-current-user";
import { logoutAction } from "@/actions/auth";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, User } from "lucide-react";

export function Header() {
  const { user } = useCurrentUser();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-md px-4 sm:px-6">
      {/* Mobile nav trigger */}
      <MobileNav />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side actions */}
      <div className="flex items-center gap-3">
        <ThemeToggle />

        {/* User info */}
        {user && (
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium leading-none">
                  {user.fullName || user.email}
                </span>
                <Badge
                  variant={user.role === "pengurus" ? "default" : "secondary"}
                  className="mt-1 w-fit text-[10px] px-1.5 py-0"
                >
                  {user.role === "pengurus" ? "Pengurus" : "Wali Santri"}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Logout */}
        <form action={logoutAction}>
          <Button variant="ghost" size="icon" className="h-9 w-9" type="submit" aria-label="Keluar">
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </header>
  );
}
