import { Prisma } from "@prisma/client";

// Prisma's Json input types don't structurally accept plain object/array
// literals (even though that's exactly what they are at runtime) — this
// centralizes the cast, and maps `null` to Prisma's JsonNull sentinel since
// a bare `null` on a Json column means something different (DbNull) to Prisma.
export function toJsonInput(
  value: unknown,
): Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined {
  if (value === undefined) return undefined;
  if (value === null) return Prisma.JsonNull;
  return value as Prisma.InputJsonValue;
}
