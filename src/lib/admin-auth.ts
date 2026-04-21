import { createHash, timingSafeEqual } from "node:crypto";

export function passwordMatches(
  input: string,
  expected: string | undefined,
): boolean {
  if (!expected) return false;
  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}
