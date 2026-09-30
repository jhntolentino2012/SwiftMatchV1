/** API types do not guarantee that a runtime JSON value is an array. */
export function arrayOrEmpty<T>(value: readonly T[] | null | undefined): T[];
export function arrayOrEmpty<T = unknown>(value: unknown): T[];
export function arrayOrEmpty<T>(value: unknown): T[] {
  return Array.isArray(value) ? value : [];
}