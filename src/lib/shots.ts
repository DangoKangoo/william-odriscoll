// Geometry for the hero's looping golf shots. Pure functions, so the static
// fallback shot (rendered at build time) and the animated loop share one model.

export type Point = { x: number; y: number };

/**
 * A shot is a quadratic Bezier from `start` to `land` through `control`, then a
 * roll to `rest`. For an ace, `rest` is the pin: the ball rolls into the cup.
 */
export type Shot = {
  start: Point;
  control: Point;
  land: Point;
  rest: Point;
  ace: boolean;
};

export type ShotArea = {
  pin: Point;
  /** The art's viewBox is square; shots start from its left side. */
  size: number;
};

const START_X = [8, 90];
const START_Y_FRACTION = [0.55, 0.97];
const LAND_RADIUS = [26, 62];
const APEX_HEIGHT = [170, 320];
const ROLL_FRACTION = [0.2, 0.45];
/** Closest a resting ball may sit to the pin: ball radius (7) + cup half-width (9) + a visible gap. */
const MIN_REST_DISTANCE = 22;
/** Contours are stretched horizontally, so the green is wider than it is tall. */
const GREEN_ASPECT = 1.18;
/** How far short of the pin an ace lands, and how far off the direct line (radians). */
const ACE_LAND_DISTANCE = [30, 55];
const ACE_LINE_JITTER = 0.3;
/**
 * Per-shot ace chance. Aces can't repeat, so the long-run rate is p / (1 + p);
 * 1/9 gives 10% overall.
 */
export const ACE_CHANCE = 1 / 9;

const between = (rand: () => number, [min, max]: number[]) =>
  min + rand() * (max - min);

/** Whether the next shot is an ace. Never two in a row. */
export function nextShotIsAce(
  previousWasAce: boolean,
  rand: () => number = Math.random,
): boolean {
  return !previousWasAce && rand() < ACE_CHANCE;
}

export function randomShot(
  area: ShotArea,
  { ace = false }: { ace?: boolean } = {},
  rand: () => number = Math.random,
): Shot {
  const { pin, size } = area;
  const start = {
    x: between(rand, START_X),
    y: size * between(rand, START_Y_FRACTION),
  };

  // Normal shots land anywhere on the green around the pin, never on it.
  // Aces land a little short, roughly on the line back toward the golfer.
  const angle = ace
    ? Math.atan2(start.y - pin.y, (start.x - pin.x) / GREEN_ASPECT) +
      (rand() - 0.5) * 2 * ACE_LINE_JITTER
    : rand() * Math.PI * 2;
  const radius = between(rand, ace ? ACE_LAND_DISTANCE : LAND_RADIUS);
  const land = {
    x: pin.x + Math.cos(angle) * radius * GREEN_ASPECT,
    y: pin.y + Math.sin(angle) * radius,
  };

  const apex = Math.min(start.y, land.y) - between(rand, APEX_HEIGHT);
  const control = {
    x: start.x + (land.x - start.x) * between(rand, [0.35, 0.55]),
    y: Math.max(apex, -60),
  };

  if (ace) return { start, control, land, rest: { ...pin }, ace };

  // Roll part of the way toward the pin, stopping short of the cup.
  const landDistance = Math.hypot(pin.x - land.x, pin.y - land.y);
  const maxRoll = Math.max(0, 1 - MIN_REST_DISTANCE / landDistance);
  const roll = Math.min(between(rand, ROLL_FRACTION), maxRoll);
  const rest = {
    x: land.x + (pin.x - land.x) * roll,
    y: land.y + (pin.y - land.y) * roll,
  };

  return { start, control, land, rest, ace };
}

export const pointBetween = (a: Point, b: Point, t: number): Point => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});

export function pointOnFlight(shot: Shot, t: number): Point {
  return pointBetween(
    pointBetween(shot.start, shot.control, t),
    pointBetween(shot.control, shot.land, t),
    t,
  );
}

/** SVG path for the flight from the start up to progress `t` (0 to 1). */
export function flightPath(shot: Shot, t: number): string {
  // De Casteljau split: the first part of a quadratic is itself a quadratic.
  const control = pointBetween(shot.start, shot.control, t);
  const end = pointOnFlight(shot, t);
  const f = (n: number) => n.toFixed(1);
  return `M${f(shot.start.x)} ${f(shot.start.y)} Q${f(control.x)} ${f(control.y)} ${f(end.x)} ${f(end.y)}`;
}
