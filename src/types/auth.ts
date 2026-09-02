export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  isSuperAdmin: boolean;
  mfaEnabled?: boolean;
  workspaceId?: string | null;
  dealershipId?: string | null;
  role?: string | null;
  memberships?: Array<{
    workspaceId: string;
    workspaceName: string;
    role: string;
  }>;
  createdAt?: string;
  onboardingCompleted?: boolean;
  onboardingStep?: number;
}

export interface UpdateOnboardingPayload {
  onboardingStep?: number;
  onboardingCompleted?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
  user: AuthUser;
}

export interface RefreshResponse {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface MeResponse {
  user: AuthUser;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  workspaceName: string;
}

export interface MessageResponse {
  message: string;
}
