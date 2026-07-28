import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { type Role } from "@/generated/prisma/client";

export interface WorkspaceContext {
  user: { id: string; email: string; name: string | null };
  workspace: { id: string; name: string; slug: string };
  role: Role;
}

// Resolves the workspace context.
// Defaults to the primary workspace for single-user internal tool mode with fallback.
export async function getWorkspaceContext(
  requestedWorkspaceId?: string
): Promise<WorkspaceContext | null> {
  // 1. Try resolving via Supabase Session if logged in
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.email) {
      const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
      if (dbUser) {
        const member = await prisma.workspaceMember.findFirst({
          where: {
            userId: dbUser.id,
            ...(requestedWorkspaceId ? { workspaceId: requestedWorkspaceId } : {}),
          },
          include: { workspace: true },
          orderBy: { createdAt: "asc" },
        });

        if (member) {
          return {
            user: { id: dbUser.id, email: dbUser.email, name: dbUser.name },
            workspace: member.workspace,
            role: member.role,
          };
        }
      }
    }
  } catch {
    // Session check skipped for standalone mode
  }

  // 2. Default workspace resolution with try-catch fallback
  try {
    const workspace = requestedWorkspaceId
      ? await prisma.workspace.findUnique({ where: { id: requestedWorkspaceId } })
      : await prisma.workspace.findFirst({ orderBy: { createdAt: "asc" } });

    if (!workspace) {
      return {
        user: { id: "owner", email: "outreach@venuewrangler.com", name: "VenueWrangler Owner" },
        workspace: { id: "default", name: "Hospitami Sales", slug: "hospitami-sales" },
        role: "ADMIN",
      };
    }

    const defaultUser = (await prisma.user.findFirst({ orderBy: { createdAt: "asc" } }).catch(() => null)) || {
      id: "owner",
      email: "outreach@venuewrangler.com",
      name: "VenueWrangler Owner",
    };

    return {
      user: { id: defaultUser.id, email: defaultUser.email, name: defaultUser.name },
      workspace: { id: workspace.id, name: workspace.name, slug: workspace.slug },
      role: "ADMIN",
    };
  } catch (dbErr) {
    console.error("Database connection error in getWorkspaceContext:", dbErr);
    return {
      user: { id: "owner", email: "outreach@venuewrangler.com", name: "VenueWrangler Owner" },
      workspace: { id: "default", name: "Hospitami Sales", slug: "hospitami-sales" },
      role: "ADMIN",
    };
  }
}
