export interface JwtPayload {
  sub?: string;
  email?: string;
  name?: string;
  workspaceId?: string;
  role?: string;
  isImpersonated?: boolean;
  impersonatedByUserId?: string;
  impersonationReason?: string;
  impersonationSessionId?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

/**
 * Decodifica o payload de um JWT de forma segura no navegador.
 * Lida com base64 e base64url com suporte completo a UTF-8 sem lançar exceções não tratadas.
 */
export function decodeJwtPayload<T extends JwtPayload = JwtPayload>(token: string): T | null {
  if (!token || typeof token !== 'string') {
    return null;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  try {
    const base64Url = parts[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (m) => m.charCodeAt(0));
    const jsonString = new TextDecoder().decode(bytes);

    const parsed = JSON.parse(jsonString);
    if (typeof parsed !== 'object' || parsed === null) {
      return null;
    }

    return parsed as T;
  } catch {
    return null;
  }
}
