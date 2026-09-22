// Generates contour-line paths that look like a golf green on a course map.
// Deterministic (seeded) so the art is identical on every build.

type Point = [number, number];

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Closed Catmull-Rom spline through the points, as cubic Bezier segments.
function smoothClosedPath(points: Point[]): string {
  const n = points.length;
  const at = (i: number) => points[(i + n) % n];
  const f = (v: number) => v.toFixed(1);
  let d = `M${f(points[0][0])},${f(points[0][1])}`;
  for (let i = 0; i < n; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    const c1: Point = [
      p1[0] + (p2[0] - p0[0]) / 6,
      p1[1] + (p2[1] - p0[1]) / 6,
    ];
    const c2: Point = [
      p2[0] - (p3[0] - p1[0]) / 6,
      p2[1] - (p3[1] - p1[1]) / 6,
    ];
    d += `C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`;
  }
  return `${d}Z`;
}

export function contourPaths(options: {
  cx: number;
  cy: number;
  rings: number;
  spacing: number;
  seed: number;
}): string[] {
  const { cx, cy, rings, spacing, seed } = options;
  const rand = mulberry32(seed);
  const waves = [2, 3, 5].map((k) => ({
    k,
    phase: rand() * Math.PI * 2,
    amp: 0.04 + rand() * 0.06,
  }));
  const steps = 48;
  const paths: string[] = [];

  for (let ring = 1; ring <= rings; ring++) {
    const radius = 22 + ring * spacing;
    // Outer rings wander more, like terrain flattening out away from the green.
    const wobble = 0.6 + ring / rings;
    const points: Point[] = [];
    for (let s = 0; s < steps; s++) {
      const theta = (s / steps) * Math.PI * 2;
      const noise = waves.reduce(
        (sum, w) =>
          sum + w.amp * wobble * Math.sin(w.k * theta + w.phase + ring * 0.18),
        0,
      );
      const r = radius * (1 + noise);
      points.push([cx + r * Math.cos(theta) * 1.18, cy + r * Math.sin(theta)]);
    }
    paths.push(smoothClosedPath(points));
  }
  return paths;
}
