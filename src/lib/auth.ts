import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { type Role } from "@/generated/prisma/client";

export interface WorkspaceContext {
  user: { id: string; email: string; name: string | null };
  workspace: { id: string; name: string; slug: string };
  role: Role;
}

// Resolves the authenticated user's workspace from Supabase session.
// Falls back to DEMO_WORKSPACE_ID env var for local dev without auth.
export async function getWorkspaceContext(
  requestedWorkspaceId?: string
): Promise<WorkspaceContext | null> {
  // Dev fallback: if auth is disabled, use the demo workspace
  const demoWorkspaceId = process.env.DEMO_WORKSPACE_ID;
  if (process.env.SUPABASE_AUTH_DISABLED === "true" && demoWorkspaceId) {
    const workspace = await prisma.workspace.findUnique({
      where: { id: demoWorkspaceId },
    });
    if (!workspace) return null;
    return {
      user: { id: "demo", email: "demo@hospitami.com", name: "Demo User" },
      workspace,
      role: "ADMIN",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
  if (!dbUser) return null;

  const member = await prisma.workspaceMember.findFirst({
    where: {
      userId: dbUser.id,
      ...(requestedWorkspaceId ? { workspaceId: requestedWorkspaceId } : {}),
    },
    include: { workspace: true },
    orderBy: { createdAt: "asc" },
  });

  if (!member) return null;
  return {
    user: { id: dbUser.id, email: dbUser.email, name: dbUser.name },
    workspace: member.workspace,
    role: member.role,
  };
}
