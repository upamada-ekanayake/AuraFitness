/**
 * Generates a simple unique identifier with a given prefix.
 */
export function createId(prefix = 'id'): string {
  const rand = Math.random().toString(36).substring(2, 9);
  const time = Date.now().toString(36).substring(4);
  return `${prefix}-${rand}-${time}`;
}
