import type { UpdateWorkspaceProfilePayload, WorkspaceProfile } from '../../types/profile.js';
import { httpClient } from './httpClient.js';

export const profileService = {
  async getProfile(workspaceId: string): Promise<WorkspaceProfile> {
    return httpClient.get<WorkspaceProfile>(`/workspaces/${workspaceId}/profile`);
  },

  async updateProfile(
    workspaceId: string,
    payload: UpdateWorkspaceProfilePayload,
  ): Promise<WorkspaceProfile> {
    return httpClient.patch<WorkspaceProfile>(`/workspaces/${workspaceId}/profile`, payload);
  },
};
