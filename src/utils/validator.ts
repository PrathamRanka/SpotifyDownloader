export function parseInteger(value: string, name: string, minimum: number, maximum: number): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new Error(`${name} must be an integer between ${minimum} and ${maximum}`);
  }
  return parsed;
}

export function requireValue(value: string, name: string): string {
  if (!value.trim()) throw new Error(`${name} is required`);
  return value.trim();
}
