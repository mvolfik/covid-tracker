<script lang="ts">
  export let date: Date;
  export let startdate: Date;
  export let xshift = 0;
  export let xscale: number;
  export let color: string;
  export let label: string | undefined = undefined;
  export let h: number;

  let x: number;
  /// @ts-expect-error: bruh
  $: x = ((date - startdate) / 24 / 3600 / 1000 + xshift) * xscale;
</script>

<polyline
  points="{x},{(h > 0 ? 1010 : 980) - h} {x},{h > 0 ? 1000 : 0}"
  style="fill: none; stroke: {color};"
/>

<text
  {x}
  y={1000 - h}
  text-anchor="middle"
  font-size="1.4em"
  fill={color}
  style="white-space: pre-line;">{label ?? date.toLocaleDateString()}</text
>
