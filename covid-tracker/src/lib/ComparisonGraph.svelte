<script lang="ts">
  import { tweened } from "svelte/motion";
  import Graph from "./Graph.svelte";
  import Datemark from "./Datemark.svelte";
  import { formatDate, formatNum, range } from "./utils";
  import type { Writable } from "svelte/store";
  import { sineOut } from "svelte/easing";

  let pastDays = 60;
  let futureDays = 25;
  export let data: Array<{ date: Date; number: number }>;
  export let label: string;

  const max: Writable<number> = tweened(14000, { duration: 500, easing: sineOut });
  $: $max = data
    .slice(-simpleXshift, -simpleXshift + pastDays + futureDays + 1)
    .concat(currentPoints)
    .reduce((m, { number }) => (isFinite(number) ? Math.max(m, number) : m), 0);

  $: xscale = 2000 / (pastDays + futureDays);
  $: yscale = 1000 / $max;

  let slidershift = 360;
  $: simpleXshift = slidershift - (data.length - pastDays - futureDays);

  const xshift: Writable<number> = tweened(-165, { duration: 1000, easing: sineOut });
  $: $xshift = simpleXshift;

  let movavgn = 4;

  // let predictl;
  // let poverlap = 5,
  // 	pback = 7,
  // 	pmult = 1.6;
  // $: predictl = DAYS - current.length + poverlap + 1;
  $: currentPoints = data.slice(data.length - pastDays);

  function getNiceIntervalFor(maxVal: number, maxN = 10) {
    const mults = [1, 2, 5];
    if (maxVal >= 1) {
      for (let n = 0; ; n++) {
        const interval = mults[n % 3] * Math.pow(10, Math.floor(n / 3));
        if (maxVal / interval < maxN) {
          return interval;
        }
      }
    } else {
      let prevInterval;
      for (let n = 0; ; n--) {
        const interval = mults[2 + (n % 3)] * Math.pow(10, Math.floor((n - 1) / 3));
        if (maxVal / interval > maxN) {
          return prevInterval;
        }
        prevInterval = interval;
      }
    }
  }

  let showPopup = false;
  let closestPoint: number;
  let popupY: number;

  $: popupX = closestPoint * xscale;
  $: popupCurrent = currentPoints.find(
    ({ date }) => date.valueOf() === currentPoints[closestPoint]?.date?.valueOf(),
  );
  $: popupHistorical = data.find(
    ({ date }) => date.valueOf() === data[closestPoint - simpleXshift]?.date?.valueOf(),
  );

  function handleMouseMove(this: SVGSVGElement, e: MouseEvent) {
    const pt = this.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const { x, y } = pt.matrixTransform(SVGSVGElement.prototype.getScreenCTM.call(this)?.inverse());
    if (0 <= x && x <= 2000) {
      showPopup = true;
      popupY = Math.max(50, Math.min(950, y));
      closestPoint = Math.round(x / xscale);
    } else showPopup = false;
  }

  $: popupRelX = (x: number) =>
    popupX < 1630 ? popupX + xscale / 2 + 19 + x : popupX - xscale / 2 - 300 - 19 + x;
</script>

<div class="outer">
  <div class="opts">
    <span>Show x={futureDays} days ahead</span>
    <input type="range" bind:value={futureDays} min="10" max="120" />
    <span>Show x={pastDays} days back</span>
    <input type="range" bind:value={pastDays} min="10" max="120" />

    <span>Historical data overlay position</span>
    <input
      type="range"
      bind:value={slidershift}
      min="0"
      max={data.length - pastDays - futureDays}
    />
    <span>Moving average: {movavgn} days</span>
    <input type="range" bind:value={movavgn} min="1" max="14" />

    <!-- <span>Překrýt predikci x={poverlap} dní</span>
	<input type="range" bind:value={poverlap} min="0" max="10" style="width: 95%;" />
	Predikovat z dat x={poverlap} dní zpět:<br />
	<input type="range" bind:value={pback} min="0" max="10" style="width: 95%;" />
	Predikce n^(x={pmult}):<br />
	<input type="range" bind:value={pmult} min="0" max="10" style="width: 95%;" /> -->
  </div>
  <svg
    viewBox="-75 -75 2080 1150"
    on:mousemove={handleMouseMove}
    on:mouseleave={() => (showPopup = false)}
  >
    <rect x="-75" y="-75" width="2080" height="1150" fill="#eee" />

    {#if showPopup}
      <rect x={popupX - xscale / 2} width={xscale} y="-75" height="1150" fill="#0bf7" />
    {/if}

    <!-- markers for current data -->
    {#each range(pastDays + futureDays)
      .map((x) => new Date(currentPoints[0].date.valueOf() + x * 24 * 3600 * 1000))
      .filter((date) => date.getDate() === 1) as date (date)}
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
    <Graph points={currentPoints.map((x) => x.number)} {movavgn} {xscale} {yscale} fill="#f00" />
    <Graph
      points={data.map((x) => x.number)}
      {movavgn}
      {xscale}
      {yscale}
      xshift={$xshift}
      fill="#777"
    />

    <!-- y axis -->
    <rect x="-75" y="-75" height="1150" width="70" fill="#eee" />
    {#each range(0, $max, getNiceIntervalFor($max, 10)) as v (v)}
      <polyline
        points="0,{1000 - v * yscale} 2000,{1000 - v * yscale}"
        style="fill: none; stroke: #222;"
      />

      <text
        x="-35"
        y={1000 - v * yscale}
        text-anchor="middle"
        style="transform: rotate(-45deg); transform-origin: -35px {1000 - v * yscale}px;"
        fill="#222">{formatNum(v)}</text
      >
    {/each}
    <rect x="-75" y="-75" height="100" width="200" fill="#ddd" />
    <text x="-60" y="-40">current trend</text>
    <polyline points="60,-45 105,-45" style="fill: none; stroke: #f00; stroke-width: 4px;" />
    <text x="-60" y="-10">historical data</text>
    <polyline points="66,-15 105,-15" style="fill: none; stroke: #222; stroke-width: 4px;" />

    {#if showPopup}
      <g class="popup">
        <path
          d={popupX < 1630
            ? `M ${popupX + xscale / 2} ${popupY}
             l 19 -11
             v -39
             h 300
             v 100
             h -300
             v -39
             Z`
            : `M ${popupX - xscale / 2} ${popupY}
             l -19 -11
             v -39
             h -300
             v 100
             h 300
             v -39
             Z`}
          fill="#06fb"
        />
        <text x={popupRelX(10)} y={popupY - 27}
          >Current data {popupCurrent === undefined
            ? ""
            : `(${formatDate(popupCurrent.date, true)})`}</text
        >
        <text x={popupRelX(20)} y={popupY - 7}
          >{popupCurrent === undefined
            ? "No data (yet)"
            : `${formatNum(popupCurrent.number)} ${label}`}</text
        >
        <text x={popupRelX(10)} y={popupY + 16}
          >Historical data {popupHistorical === undefined
            ? ""
            : `(${formatDate(popupHistorical.date, true)})`}</text
        >
        <text x={popupRelX(20)} y={popupY + 36}
          >{popupHistorical === undefined
            ? "Unknown error happened"
            : `${formatNum(popupHistorical.number)} ${label}`}</text
        >
      </g>
    {/if}
  </svg>
</div>

<style>
  .outer {
    display: grid;
    grid-template-rows: auto 1fr;
    height: 100%;
  }
  .opts {
    display: grid;
    grid-template-columns: auto 1fr;
    padding: 0 1rem;
  }
  svg {
    max-height: 100%;
    max-width: 100%;
    margin: 0 auto;
    display: block;
  }
  svg :global(text) {
    font-size: 1.5rem;
  }
  svg .popup text {
    font-size: 1.15rem;
  }
</style>
