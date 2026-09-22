// The "currently building / in talks" line under the work heading.

function assertCount(name: string, value: number) {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(
      `[work] ${name} must be a whole number 0 or more, got ${value}`,
    );
  }
}

/** Returns the parts of the status line (joined with a dot); empty when both counts are 0. */
export function workStatusParts(inProgress: number, inTalks: number): string[] {
  assertCount("work.inProgress", inProgress);
  assertCount("work.inTalks", inTalks);

  const parts: string[] = [];
  if (inProgress > 0) {
    parts.push(
      `Currently building ${inProgress} site${inProgress === 1 ? "" : "s"}`,
    );
  }
  if (inTalks > 0) {
    parts.push(
      inProgress > 0
        ? `in talks with ${inTalks} more`
        : `In talks with ${inTalks} golf business${inTalks === 1 ? "" : "es"}`,
    );
  }
  return parts;
}
