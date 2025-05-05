"use client";

import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { useSession } from "~/lib/auth-client";

interface InviteCode {
  id: string;
  code: string;
  teamId: string;
  teamName: string;
  expiresAt: string;
  maxUses: number;
  uses: number;
  createdAt: string;
}

export function InviteCodeHistory() {
  const { data: session } = useSession();
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInviteCodes = async () => {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        const res = await fetch("/api/teams/invite/history");

        if (!res.ok) {
          throw new Error("Failed to fetch invite codes");
        }

        const data = await res.json();
        setInviteCodes(data.inviteCodes || []);
      } catch (err) {
        console.error("Error fetching invite codes:", err);
        setError("Failed to load invite code history.");
      } finally {
        setLoading(false);
      }
    };

    void fetchInviteCodes();
  }, [session?.user?.id]);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    // You could add a toast notification here
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Invite Code History</CardTitle>
          <CardDescription>Previously generated invite codes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 border rounded-md"
              >
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Invite Code History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-md bg-destructive/10 text-destructive">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Invite Code History</CardTitle>
        <CardDescription>Previously generated invite codes</CardDescription>
      </CardHeader>
      <CardContent>
        {inviteCodes.length === 0 ? (
          <div className="text-center p-6 text-muted-foreground">
            No invite codes have been generated yet.
          </div>
        ) : (
          <div className="space-y-3">
            {inviteCodes.map((code) => {
              const isExpired = new Date(code.expiresAt) < new Date();
              const isFullyUsed = code.uses >= code.maxUses;
              const status = isExpired
                ? "Expired"
                : isFullyUsed
                  ? "Fully Used"
                  : "Active";
              const statusColor =
                isExpired || isFullyUsed
                  ? "text-muted-foreground"
                  : "text-green-600";

              return (
                <div
                  key={code.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-md ${isExpired || isFullyUsed ? "bg-muted/30" : ""}`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium">{code.code}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${statusColor} bg-muted`}
                      >
                        {status}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <span>Team: {code.teamName}</span>
                      <span className="mx-2">•</span>
                      <span>
                        Created:{" "}
                        {format(new Date(code.createdAt), "MMM d, yyyy")}
                      </span>
                      <span className="mx-2">•</span>
                      <span>
                        Expires:{" "}
                        {format(new Date(code.expiresAt), "MMM d, yyyy")}
                      </span>
                      <span className="mx-2">•</span>
                      <span>
                        Uses: {code.uses}/{code.maxUses}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 sm:mt-0"
                    disabled={isExpired || isFullyUsed}
                    onClick={() => copyToClipboard(code.code)}
                  >
                    Copy
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
