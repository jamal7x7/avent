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
    <Card className="border-2 border-muted/50 hover:border-primary/20 transition-colors shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <svg
            role="graphics-symbol img"
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Invite Code History
        </CardTitle>
        <CardDescription className="text-base">
          View and manage your previously generated invite codes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {inviteCodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-muted rounded-lg bg-muted/10 text-center">
            <svg
              role="graphics-symbol img"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted-foreground/50 mb-3"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <line x1="3" x2="21" y1="9" y2="9" />
              <path d="M8 3v3" />
              <path d="M16 3v3" />
              <circle cx="12" cy="16" r="1" />
            </svg>
            <p className="text-muted-foreground font-medium">
              No invite codes have been generated yet
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Generate a code to invite students to join your team
            </p>
          </div>
        ) : (
          <div className="overflow-hidden border border-muted rounded-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Code
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Team
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground hidden md:table-cell">
                      Created
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground hidden md:table-cell">
                      Expires
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Uses
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted">
                  {inviteCodes.map((code) => {
                    const isExpired = new Date(code.expiresAt) < new Date();
                    const isFullyUsed = code.uses >= code.maxUses;
                    const status = isExpired
                      ? "Expired"
                      : isFullyUsed
                        ? "Fully Used"
                        : "Active";

                    let statusColor = "bg-green-100 text-green-700";
                    let statusIcon = (
                      <svg
                        role="graphics-symbol img"
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                    );

                    if (isExpired) {
                      statusColor = "bg-muted text-muted-foreground";
                      statusIcon = (
                        <svg
                          role="graphics-symbol img"
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="8" x2="16" y1="12" y2="12" />
                        </svg>
                      );
                    } else if (isFullyUsed) {
                      statusColor = "bg-amber-100 text-amber-700";
                      statusIcon = (
                        <svg
                          role="graphics-symbol img"
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                          <path d="M12 16v.01" />
                          <path d="M12 8v4" />
                        </svg>
                      );
                    }

                    return (
                      <tr
                        key={code.id}
                        className={`${isExpired || isFullyUsed ? "bg-muted/20" : "hover:bg-muted/10"}`}
                      >
                        <td className="px-4 py-3 text-sm font-mono font-medium">
                          {code.code}
                        </td>
                        <td className="px-4 py-3 text-sm">{code.teamName}</td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}
                          >
                            {statusIcon}
                            {status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                          {format(new Date(code.createdAt), "MMM d, yyyy")}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                          {format(new Date(code.expiresAt), "MMM d, yyyy")}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`${code.uses === code.maxUses ? "text-amber-600" : "text-muted-foreground"}`}
                          >
                            {code.uses}/{code.maxUses}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 px-2 ${isExpired || isFullyUsed ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/10 hover:text-primary"}`}
                            disabled={isExpired || isFullyUsed}
                            onClick={() => copyToClipboard(code.code)}
                          >
                            <svg
                              role="graphics-symbol img"
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="mr-1"
                            >
                              <rect
                                width="14"
                                height="14"
                                x="8"
                                y="8"
                                rx="2"
                                ry="2"
                              />
                              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                            </svg>
                            Copy
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
