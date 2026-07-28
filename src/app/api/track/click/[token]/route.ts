import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseTrackingToken } from "@/lib/email/tracking";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const payload = parseTrackingToken(token);

  if (payload && payload.type === "click" && payload.url) {
    prisma.campaignLead
      .updateMany({
        where: { id: payload.id, clickedAt: null },
        data: { clickedAt: new Date(), status: "clicked" },
      })
      .catch(() => {});

    return NextResponse.redirect(payload.url);
  }

  return NextResponse.json({ error: "Invalid token" }, { status: 400 });
}
