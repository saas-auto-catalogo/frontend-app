const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^https?:\/\/.+/i;
const STATE_REGEX = /^[A-Z]{2}$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

export function passwordsMatch(password: string, confirmation: string): boolean {
  return password === confirmation;
}

export function stripNonDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function isValidTradeName(value: string): boolean {
  return value.trim().length >= 2;
}

export function isValidCnpj(value: string): boolean {
  return stripNonDigits(value).length >= 11;
}

export function isValidPhone(value: string): boolean {
  return stripNonDigits(value).length >= 8;
}

export function isValidCity(value: string): boolean {
  return value.trim().length >= 2;
}

export function isValidState(value: string): boolean {
  return STATE_REGEX.test(value.trim().toUpperCase());
}

export function isValidUrl(value: string): boolean {
  return URL_REGEX.test(value.trim());
}
