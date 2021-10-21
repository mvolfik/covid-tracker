<script lang="ts">
  export let points: number[];
  export let movavgn = 3;
  export let xscale: number;
  export let yscale: number;
  export let xshift = 0;
  export let fill: string;

  // export let pback = 7;
  // export let pmult = 2;
  // export let predict = 0;
  // export let poverlap = 5;

  let movavg: number[] = [];
  function calcMovavg(arr: number[], n: number) {
    const newarr = [];
    for (let i = n - 1; i < arr.length; i++) {
      let s = 0;
      for (let j = i - n + 1; j <= i; j++) s += arr[j];
      newarr.push(s / n);
    }
    return newarr;
  }
  $: movavg = calcMovavg(points, movavgn);

  // let predictpoints = [];
  // function calcPPs(old, n, overlap, back, mult) {
  //   const calc = old.slice(0, old.length - overlap);
  //   const pp = [];
  //   for (let x = 0; x < n; x++) {
  //     let s = 0;
  //     for (let j = calc.length - back; j < calc.length; j++) {
  //       s += calc[j];
  //     }
  //     const y = (s / back) * mult;
  //     pp.push({ x: calc.length, y });
  //     calc.push(y);
  //   }
  //   return pp;
  // }

  // $: predictpoints = calcPPs(points, predict, poverlap, pback, pmult);
</script>

{#each [...points.entries()] as [i, v]}
  <circle cx={(i + xshift) * xscale} cy={1000 - v * yscale} r="4" style="fill: {fill};" />
{/each}
<polyline
  points={movavg
    .map((v, i) => `${(i + (movavgn - 1) / 2 + xshift) * xscale},${1000 - v * yscale}`)
    .join(" ")}
  style="fill: none; stroke: {fill}"
/>
<!-- <polyline
  points={predictpoints.map(({ x, y }) => `${x * xscale},${1000 - y * yscale}`).join(" ")}
  style="fill: none; stroke: blue;"
/> -->
