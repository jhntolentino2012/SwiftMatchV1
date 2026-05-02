export const OWNER_EMAILS = new Set<string>([
  "jhn.tolentino2012@gmail.com",
]);

export function isOwnerEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return OWNER_EMAILS.has(email.trim().toLowerCase());
}
