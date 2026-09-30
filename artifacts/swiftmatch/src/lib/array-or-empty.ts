/** API types do not guarantee that a runtime JSON value is an array. */
export function arrayOrEmpty<T>(value: T[] | unknown): T[] {
  return Array.isArray(value) ? value : [];
}