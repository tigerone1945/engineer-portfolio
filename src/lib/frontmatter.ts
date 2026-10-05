export function requireString(data: Record<string, unknown>, field: string, source: string): string {
  const value = data[field];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${source}: missing or invalid "${field}"`);
  }
  return value;
}
