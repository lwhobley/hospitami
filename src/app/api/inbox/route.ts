import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get("workspaceId");
  const unreadOnly = request.nextUrl.searchParams.get("unreadOnly") === "true";

  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
  }

  const threads = await prisma.inboxThread.findMany({
    where: {
      workspaceId,
      isArchived: false,
      ...(unreadOnly ? { isRead: false } : {}),
    },
    include: {
      messages: { orderBy: { sentAt: "asc" } },
    },
    orderBy: { lastMessageAt: "desc" },
  });

  return NextResponse.json({ threads });
}
