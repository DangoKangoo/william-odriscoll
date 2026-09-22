// Geometry for the hero's looping golf shots. Pure functions, so the static
// fallback shot (rendered at build time) and the animated loop share one model.

export type Point = { x: number; y: number };

/** A shot is a quadratic Bezier from `start` to `land` through `control`, then a short roll. */
export type Shot = { start: Point; control: Point; land: Point; rest: Point };

export type ShotArea = {
  pin: Point;
  /** The art's viewBox is square; shots start from its left side. */
  size: number;
};

const START_X = [8, 90];
const START_Y_FRACTION = [0.55, 0.97];
const LAND_RADIUS = [22, 62];
const APEX_HEIGHT = [170, 320];
const ROLL_FRACTION = [0.2, 0.45];
/** Contours are stretched horizontally, so the green is wider than it is tall. */
const GREEN_ASPECT = 1.18;

const between = (rand: () => number, [min, max]: number[]) =>
  min + rand() * (max - min);

export function randomShot(
  area: ShotArea,
  rand: () => number = Math.random,
): Shot {
  const { pin, size } = area;
  const start = {
    x: between(rand, START_X),
    y: size * between(rand, START_Y_FRACTION),
  };

  // Land somewhere on the green around the pin, never on it.
  const angle = rand() * Math.PI * 2;
  const radius = between(rand, LAND_RADIUS);
  const land = {
    x: pin.x + Math.cos(angle) * radius * GREEN_ASPECT,
    y: pin.y + Math.sin(angle) * radius,
  };

  const apex = Math.min(start.y, land.y) - between(rand, APEX_HEIGHT);
  const control = {
    x: start.x + (land.x - start.x) * between(rand, [0.35, 0.55]),
    y: Math.max(apex, -60),
  };

  // Roll part of the way toward the pin.
  const roll = between(rand, ROLL_FRACTION);
  const rest = {
    x: land.x + (pin.x - land.x) * roll,
    y: land.y + (pin.y - land.y) * roll,
  };

  return { start, control, land, rest };
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
