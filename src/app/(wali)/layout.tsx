"use client";

import { logoutAction } from "@/actions/auth";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogOut } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export default function WaliLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useCurrentUser();

  return (
    <div className="min-h-screen bg-background">
      {/* Simple header for Wali */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-md px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-sm">{APP_NAME}</span>
            {user && (
              <p className="text-[10px] text-muted-foreground">
                Portal Wali — {user.fullName || user.email}
              </p>
            )}
          </div>
        </div>
        <div className="flex-1" />
        <ThemeToggle />
        <form action={logoutAction}>
          <Button variant="ghost" size="icon" className="h-9 w-9" type="submit">
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </header>

      <main className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        {children}
      </main>
    </div>
  );
}
