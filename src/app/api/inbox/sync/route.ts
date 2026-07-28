import { NextResponse, type NextRequest } from "next/server";
import { getWorkspaceContext } from "@/lib/auth";
import { syncImapRepliesForSender } from "@/lib/email/imap-sync";

export async function POST(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get("workspaceId") ?? undefined;
  const senderId = request.nextUrl.searchParams.get("senderId") ?? undefined;

  const ctx = await getWorkspaceContext(workspaceId);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await syncImapRepliesForSender(senderId, ctx.workspace.id);

  if (result.error) {
    return NextResponse.json({ error: result.error, synced: result.synced }, { status: 400 });
  }

  return NextResponse.json({ success: true, synced: result.synced });
}

export async function GET(request: NextRequest) {
  return POST(request);
}
