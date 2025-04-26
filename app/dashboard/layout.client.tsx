"use client";

import { LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "~/lib/auth-client";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
}

export function DashboardLayoutClient({
  children,
}: DashboardLayoutClientProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navigation = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Profile", href: "/dashboard/profile" },
    { name: "Settings", href: "/dashboard/settings" },
  ];

  const handleSignOut = () => {
    void signOut();
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">{children}</main>
    </div>
  );
}
