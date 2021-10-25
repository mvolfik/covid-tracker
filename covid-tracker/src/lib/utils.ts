export function range(a: number, b: number | undefined = undefined, c = 1): number[] {
  if (b === undefined) {
    [a, b] = [0, a];
  }
  return [...Array(Math.ceil(Math.abs(b - a) / c)).keys()].map((x) => a + c * x);
}

export function formatDate(d: Date, showDoW = false): string {
  return d.toLocaleDateString(undefined, {
    timeZone: "UTC",
    weekday: showDoW ? "short" : undefined,
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}

export function formatNum(v: number): string {
  return v >= 1 || v === 0 ? v.toString() : v.toPrecision(3).replace(/0*$/, "");
}
