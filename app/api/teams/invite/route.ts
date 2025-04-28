import { NextRequest, NextResponse } from "next/server";
import { generateInviteCode } from "~/app/dashboard/team-management/actions";
import { auth } from "~/lib/auth";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  try {
    const code = await generateInviteCode({ ...body, userId: session.user.id });
    return NextResponse.json({ code });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
