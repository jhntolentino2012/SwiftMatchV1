/** Shared, server-only owner identity policy. Never trust an email from a JWT or body. */
export function isOwnerEmail(email: string): boolean {
  return [
    "jhn.tolentino2012@gmail.com",
    ...(process.env["OWNER_EMAILS"]?.split(",") ?? []),
  ].some(value => value.trim().toLowerCase() === email.trim().toLowerCase());
}