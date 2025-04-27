import { LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "~/lib/auth-client";
import { cn } from "~/lib/utils";
import { Avatar } from "~/components/avatar/avatar";
import { Button } from "~/components/primitives/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/primitives/dropdown-menu";
import { Badge } from "./ui/badge";

export interface AuthAvatarProps {
  name?: string;
  email?: string;
  role?: string;
  image?: string;
  className?: string;
  isDashboard?: boolean;
  showDetails?: boolean;
}

export function AuthAvatar({
  name = "User Name",
  email = "user@email.com",
  role = "User",
  image,
  className = "",
  isDashboard = false,
  showDetails = false,
}: AuthAvatarProps) {
  const router = useRouter();
  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <DropdownMenu >
      <DropdownMenuTrigger className="" asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            // Use ring-inset for inner ring, avoid ring-offset so ring doesn't extend outside
            "rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
            showDetails ? "w-full justify-start px-2 py-6 flex items-center" : "py-2",
            className
          )}
        >
          {image ? (
            <Avatar src={image} alt={name} size={36} className="h-9 w-9" />
          ) : (
            <Avatar size={36} className="h-9 w-9" />
          )}
          {showDetails && (
            <span className="flex flex-col ml-2 text-left ">
              <span className="text-muted-foreground/60 text-sm truncate">{name} <Badge  variant="outline" className="text-[10px]">{role}</Badge></span>
              <span className="text-muted-foreground/60 text-[10px] truncate">{email}</span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            {image ? (
              <Avatar src={image} alt={name} size={28} className="h-7 w-7" />
            ) : (
              <Avatar size={28} className="h-7 w-7" />
            )}
          </div>
          <div className="flex flex-col space-y-0.5">
            <p className="text-sm font-medium">{name}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[160px]">{email}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" /> Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" /> Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className={cn(
            "cursor-pointer",
            isDashboard ? "text-red-600" : "text-destructive focus:text-destructive"
          )}
        >
          <LogOut className="mr-2 h-4 w-4" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
