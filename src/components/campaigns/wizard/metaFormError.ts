export type MetaFormErrorKind = 'auth' | 'permission' | 'other';

const PERMISSION_PATTERNS = [
  /permission/i,
  /permiss[ãa]o/i,
  /#200/i,
  /leadgen/i,
  /lead gen/i,
  /page access token/i,
  /#190/i,
  /scoped/i,
  /business integration/i,
];

const AUTH_PATTERNS = [
  /token de acesso meta/i,
  /token meta/i,
  /expirad/i,
  /expired/i,
  /unauth/i,
  /inv[áa]lid/i,
  /reconecte a integra[çc][ãa]o/i,
];

export function classifyMetaFormError(message: string): MetaFormErrorKind {
  if (PERMISSION_PATTERNS.some((pattern) => pattern.test(message))) {
    return 'permission';
  }
  if (AUTH_PATTERNS.some((pattern) => pattern.test(message))) {
    return 'auth';
  }
  return 'other';
}