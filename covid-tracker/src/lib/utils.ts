export function range(a: number, b: number | undefined = undefined, c = 1): number[] {
  if (b === undefined) {
    [a, b] = [0, a];
  }
  return [...Array(Math.ceil(Math.abs(b - a) / c)).keys()].map((x) => a + c * x);
}
