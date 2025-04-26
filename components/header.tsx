"use client";

import { LogOut, Menu, Settings, User, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "~/lib/auth-client";

import { useState } from "react";
import { Avatar } from "~/components/avatar/avatar";
import { Button } from "~/components/primitives/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/primitives/dropdown-menu";
import { cn } from "~/lib/utils";
import { LanguageSwitcher } from "./language-switcher";
import { NotificationsWidget } from "./notifications/notifications-widget";
import { ThemeToggle } from "./theme-toggle";

interface HeaderProps {
  showAuth?: boolean;
  isDashboard?: boolean;
  children?: React.ReactNode;
}

export function Header({ showAuth = true, isDashboard = false }: HeaderProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    void signOut();
  };

  const mainNavigation = [
    { name: "Home", href: "/" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Products", href: "/products" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Account", href: "/dash" },
  ];

  const dashboardNavigation = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Profile", href: "/dashboard/profile" },
    { name: "Settings", href: "/dashboard/settings" },
  ];

  const navigation = isDashboard ? dashboardNavigation : mainNavigation;

  const renderContent = () => (
    <header className="fixed top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-xl font-bold",
                    !isDashboard &&
                      "bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent tracking-tight",
                  )}
                >
                  Avent
                </span>
              </Link>
              <span className="relative mb-4  inline-flex items-center select-none">
                <span
                  className="pointer-events-none absolute inset-0 h-full w-full rounded-sm blur-md"
                  style={{
                    background:
                      "conic-gradient(from 0deg at 50% 50%, #336ff5 0%, #e7bd4b 50%, #336ff5 100%)",
                    transform: "scale(0.9)",
                    willChange: "transform",
                    backfaceVisibility: "hidden",
                    zIndex: 0,
                  }}
                  aria-hidden="true"
                />
                <span className="relative z-10 rounded-sm bg-zinc-800 px-1.5 py-0.5 text-[10px] leading-none font-medium text-zinc-50 outline outline-[#565656a6]">
                  beta
                </span>
              </span>
            </div>

            <nav className="hidden md:flex">
              <ul className="flex items-center gap-6">
                {navigation.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname?.startsWith(item.href));

                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          "text-sm font-medium transition-colors hover:text-primary",
                          isActive
                            ? "text-primary font-semibold"
                            : "text-muted-foreground",
                        )}
                      >
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {!isDashboard && <LanguageSwitcher />}

            <NotificationsWidget />

            {!isDashboard && <ThemeToggle />}

            {showAuth && (
              <div className="hidden md:block">
                {session ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="relative overflow-hidden rounded-full"
                      >
                        {session.user?.image ? (
                          <Avatar
                            src={session.user.image}
                            alt={session.user.name || undefined}
                            size={36}
                            className="h-9 w-9"
                          />
                        ) : (
                          <Avatar size={36} className="h-9 w-9" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="flex items-center justify-start gap-2 p-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          {session.user?.image ? (
                            <Avatar
                              src={session.user.image}
                              alt={session.user.name || undefined}
                              size={28}
                              className="h-7 w-7"
                            />
                          ) : (
                            <Avatar size={28} className="h-7 w-7" />
                          )}
                        </div>
                        <div className="flex flex-col space-y-0.5">
                          <p className="text-sm font-medium">
                            {session.user?.name || "User"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-[160px]">
                            {session.user?.email}
                          </p>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard/profile"
                          className="cursor-pointer"
                        >
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard/settings"
                          className="cursor-pointer"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleSignOut}
                        className={cn(
                          "cursor-pointer",
                          isDashboard
                            ? "text-red-600"
                            : "text-destructive focus:text-destructive",
                        )}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link href="/auth/sign-in">
                      <Button variant="ghost" size="sm">
                        Log in
                      </Button>
                    </Link>
                    <Link href="/auth/sign-up">
                      <Button size="sm">Sign up</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}

           

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-4 py-3 border-b">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "block py-2 px-3 text-base font-medium rounded-md",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted/50 hover:text-primary",
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {showAuth && !session && (
            <div className="space-y-1 px-4 py-3 border-b">
              <Link
                href="/auth/sign-in"
                className="block py-2 px-3 text-base font-medium rounded-md hover:bg-muted/50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                href="/auth/sign-up"
                className="block py-2 px-3 text-base font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );

  return renderContent();
}
