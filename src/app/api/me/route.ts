import { NextResponse } from "next/server";
import { getWorkspaceContext } from "@/lib/auth";

export async function GET() {
  const ctx = await getWorkspaceContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    user: ctx.user,
    workspace: ctx.workspace,
    role: ctx.role,
  });
}
