import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWorkspaceContext } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const queryWs = request.nextUrl.searchParams.get("workspaceId") ?? undefined;
  const ctx = await getWorkspaceContext(queryWs);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspaceId = ctx.workspace.id;
  const unreadOnly = request.nextUrl.searchParams.get("unreadOnly") === "true";

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
