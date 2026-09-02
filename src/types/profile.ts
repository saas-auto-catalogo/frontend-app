export interface WorkspaceProfile {
  workspace: {
    id: string;
    name: string;
    slug: string;
    cnpj: string | null;
    phone: string | null;
    city: string | null;
    state: string | null;
  };
  dealership: {
    id: string;
    tradeName: string;
    legalName: string | null;
    cnpj: string | null;
    phone: string | null;
    city: string | null;
    state: string | null;
    logoUrl: string | null;
    email: string | null;
  };
}

export interface UpdateWorkspaceProfilePayload {
  tradeName?: string;
  cnpj?: string;
  phone?: string;
  city?: string;
  state?: string;
  logoUrl?: string | null;
}
