<script lang="ts">
  import { tweened } from "svelte/motion";
  import Graph from "./Graph.svelte";
  import Datemark from "./Datemark.svelte";
  import { range } from "./utils";
  import type { Writable } from "svelte/store";
  import { sineOut } from "svelte/easing";

  export let pastDays: number;
  export let futureDays: number;
  export let data: Array<{ date: Date; cases: number }>;

  const max: Writable<number> = tweened(14000, { duration: 500, easing: sineOut });
  $: $max = data
    .slice(-simpleXshift, -simpleXshift + pastDays + futureDays + 1)
    .concat(currentPoints)
    .reduce((m, { cases }) => Math.max(m, cases), 0);

  let xscale: number;
  let yscale: number;

  $: xscale = 2000 / (pastDays + futureDays);
  $: yscale = 1000 / $max;

  let simpleXshift: number;
  let slidershift = 346;
  $: simpleXshift = slidershift - (data.length - pastDays - futureDays);

  const xshift: Writable<number> = tweened(-165, { duration: 1000, easing: sineOut });
  $: $xshift = simpleXshift;

  let movavgn = 4;

  // let predictl;
  // let poverlap = 5,
  // 	pback = 7,
  // 	pmult = 1.6;
  // $: predictl = DAYS - current.length + poverlap + 1;
  let currentPoints: typeof data;
  $: currentPoints = data.slice(data.length - pastDays);
</script>

<div id="opts">
  <span>Historical data overlay position</span>
  <input
    type="range"
    bind:value={slidershift}
    min="0"
    max={data.length - pastDays - futureDays}
    style="width: 95%;"
  />
  <span>Moving average: {movavgn} days</span>
  <input type="range" bind:value={movavgn} min="1" max="14" style="width: 95%;" />
  <!-- <span>Překrýt predikci x={poverlap} dní</span>
	<input type="range" bind:value={poverlap} min="0" max="10" style="width: 95%;" />
	Predikovat z dat x={poverlap} dní zpět:<br />
	<input type="range" bind:value={pback} min="0" max="10" style="width: 95%;" />
	Predikce n^(x={pmult}):<br />
	<input type="range" bind:value={pmult} min="0" max="10" style="width: 95%;" /> -->
</div>
<svg viewBox="-75 -75 2075 1150">
  <rect x="-75" y="-75" width="2075" height="1150" fill="#eee" />
  <!-- markers for current data -->
  {#each currentPoints.filter(({ date }) => date.getDate() === 1) as { date } (date)}
    <Datemark startdate={currentPoints[0].date} {date} {xscale} color="#f00" xshift={0} h={-30} />
  {/each}
  <Datemark
    startdate={currentPoints[0].date}
    date={new Date("2021-10-09")}
    {xscale}
    color="#f00"
    h={-70}
    label="Election"
  />
  <Datemark
    startdate={currentPoints[0].date}
    date={new Date("2021-11-12")}
    {xscale}
    color="#f00"
    h={-30}
  />

  <!-- markers for historical data -->
  {#each data.filter(({ date }) => date.getDate() === 1) as { date } (date)}
    <Datemark startdate={data[0].date} {date} {xscale} color="#555" xshift={$xshift} h={1030} />
  {/each}
  <Datemark
    startdate={data[0].date}
    date={new Date("2020-10-03")}
    {xscale}
    color="#555"
    xshift={$xshift}
    h={800}
    label="Election"
  />
  <Datemark
    startdate={data[0].date}
    date={new Date("2020-10-12")}
    {xscale}
    color="#555"
    xshift={$xshift}
    h={950}
    label="Schools closed, gatherings restricted"
  />

  <!-- data points -->
  <Graph points={currentPoints.map((x) => x.cases)} {movavgn} {xscale} {yscale} fill="#f00" />
  <Graph
    points={data.map((x) => x.cases)}
    {movavgn}
    {xscale}
    {yscale}
    xshift={$xshift}
    fill="#777"
  />

  <!-- y axis -->
  <rect x="-75" y="-75" height="1150" width="70" fill="#eee" />
  {#each range( 0, $max, [200, 500, 1000, 2000].find((x) => $max / x < 10), ).slice(1) as v (v)}
    <polyline
      points="0,{1000 - v * yscale} 2000,{1000 - v * yscale}"
      style="fill: none; stroke: #222;"
    />

    <text
      x="-35"
      y={1000 - v * yscale}
      text-anchor="middle"
      font-size="1.4em"
      style="transform: rotate(-45deg); transform-origin: -35px {1000 - v * yscale}px;"
      fill="#222">{v}</text
    >
  {/each}
  <rect x="-75" y="-75" height="100" width="200" fill="#ddd" />
  <text x="-60" y="-40" font-size="1.4em">current trend</text>
  <polyline points="60,-45 105,-45" style="fill: none; stroke: #f00; stroke-width: 4px;" />
  <text x="-60" y="-10" font-size="1.4em">historical data</text>
  <polyline points="66,-15 105,-15" style="fill: none; stroke: #222; stroke-width: 4px;" />
</svg>

<style>
  svg {
    max-height: 85vh;
    margin: 0 auto;
    display: block;
  }
  div#opts {
    display: grid;
  }
</style>
