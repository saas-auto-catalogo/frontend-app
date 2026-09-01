const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

export function passwordsMatch(password: string, confirmation: string): boolean {
  return password === confirmation;
}
