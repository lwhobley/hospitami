import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseTrackingToken } from "@/lib/email/tracking";

// 1×1 transparent GIF
const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const payload = parseTrackingToken(token);

  if (payload && payload.type === "open") {
    // Fire and forget — don't block the pixel response
    prisma.campaignLead
      .updateMany({
        where: { id: payload.id, openedAt: null },
        data: { openedAt: new Date(), status: "opened" },
      })
      .catch(() => {});
  }

  return new NextResponse(PIXEL, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
    },
  });
}
