import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWorkspaceContext } from "@/lib/auth";
import { type SenderStatus } from "@/generated/prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const workspaceId = request.nextUrl.searchParams.get("workspaceId") ?? undefined;
  const ctx = await getWorkspaceContext(workspaceId);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as {
    name?: string;
    status?: SenderStatus;
    dailyLimit?: number;
    action?: "verify-domain";
  };

  // Handle domain verification
  if (body.action === "verify-domain") {
    const domain = await prisma.senderDomain.update({
      where: { id },
      data: { verified: true },
    });
    return NextResponse.json(domain);
  }

  // Update sender account
  const account = await prisma.senderAccount.update({
    where: { id, workspaceId: ctx.workspace.id },
    data: {
      ...(body.name && { name: body.name }),
      ...(body.status && { status: body.status }),
      ...(body.dailyLimit && { dailyLimit: body.dailyLimit }),
    },
  });
  return NextResponse.json(account);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const workspaceId = request.nextUrl.searchParams.get("workspaceId") ?? undefined;
  const ctx = await getWorkspaceContext(workspaceId);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Try deleting as account first, then domain
  try {
    await prisma.senderAccount.delete({
      where: { id, workspaceId: ctx.workspace.id },
    });
  } catch {
    await prisma.senderDomain.delete({
      where: { id, workspaceId: ctx.workspace.id },
    });
  }

  return NextResponse.json({ ok: true });
}
