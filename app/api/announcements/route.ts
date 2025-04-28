import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import * as z from "zod"; // Import Zod
import {
  createAnnouncement,
  fetchAnnouncements,
} from "~/app/dashboard/announcements/actions"; // Import createAnnouncement
import { auth } from "~/lib/auth";

// Define Zod schema for validation
const createAnnouncementSchema = z.object({
  content: z.string().min(1).max(300),
  teamIds: z.array(z.string()).optional(), // Optional, empty array means all teams
  senderId: z.string(),
  senderRole: z.enum(["teacher", "admin", "staff"]),
});

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json(
      { announcements: [], hasMore: false },
      { status: 401 },
    );
  }
  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get("teamId") || "all";
  const page = Number.parseInt(searchParams.get("page") || "1", 10);
  const pageSize = 10;
  const data = await fetchAnnouncements(
    session.user.id,
    teamId,
    page,
    pageSize,
  );
  return NextResponse.json({
    announcements: data.map((a) => ({
      ...a,
      createdAt:
        typeof a.createdAt === "string"
          ? a.createdAt
          : a.createdAt.toISOString(),
      teamId: a.teamId ?? "",
      teamName: a.teamName ?? "",
    })),
    hasMore: data.length === pageSize,
  });
}

// Add POST handler
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Validate user role (only teachers, admins, staff can post)
  const validRoles = ["teacher", "admin", "staff"];
  if (!session.user.role || !validRoles.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const validation = createAnnouncementSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 },
      );
    }

    // Ensure senderId matches the authenticated user
    if (validation.data.senderId !== session.user.id) {
      return NextResponse.json(
        { error: "Sender ID mismatch" },
        { status: 403 },
      );
    }

    // Ensure senderRole matches the authenticated user's role
    if (validation.data.senderRole !== session.user.role) {
      return NextResponse.json(
        { error: "Sender role mismatch" },
        { status: 403 },
      );
    }

    const announcementData = {
      content: validation.data.content,
      senderId: session.user.id,
      senderRole: session.user.role as "teacher" | "admin" | "staff",
      teamIds:
        validation.data.teamIds && validation.data.teamIds.length > 0
          ? validation.data.teamIds
          : undefined, // Pass undefined if empty for 'all teams'
    };

    const newAnnouncement = await createAnnouncement({
      ...announcementData,
      teamIds: announcementData.teamIds || [], // Ensure teamIds is always an array
    });

    return NextResponse.json(
      { announcement: newAnnouncement },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create announcement:", error);
    // Check if the error is a known type or has a specific message
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: "Failed to create announcement", details: errorMessage },
      { status: 500 },
    );
  }
}
