"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";

interface MeResponse {
  user: { id: string; email: string; name: string | null };
  workspace: { id: string; name: string; slug: string };
  role: string;
}

interface WorkspaceContextValue {
  workspaceId: string | null;
  workspace: MeResponse["workspace"] | null;
  user: MeResponse["user"] | null;
  role: string | null;
  isLoading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextValue>({
  workspaceId: null,
  workspace: null,
  user: null,
  role: null,
  isLoading: true,
});

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const demoWorkspaceId =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_DEMO_WORKSPACE_ID ?? null
      : null;

  const { data, isLoading } = useQuery<MeResponse | null>({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await fetch("/api/me");
      if (!res.ok) return null;
      return res.json() as Promise<MeResponse>;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const workspaceId = data?.workspace?.id ?? demoWorkspaceId;

  return (
    <WorkspaceContext.Provider
      value={{
        workspaceId,
        workspace: data?.workspace ?? null,
        user: data?.user ?? null,
        role: data?.role ?? null,
        isLoading: isLoading && !demoWorkspaceId,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  return useContext(WorkspaceContext);
}
