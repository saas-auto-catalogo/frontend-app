import { useAuth } from '../context/AuthContext.js';

export function useWorkspace() {
  const { user } = useAuth();

  return {
    workspaceId: user?.workspaceId ?? user?.memberships?.[0]?.workspaceId,
    workspaceName: user?.memberships?.[0]?.workspaceName,
    role: user?.role ?? user?.memberships?.[0]?.role,
  };
}
