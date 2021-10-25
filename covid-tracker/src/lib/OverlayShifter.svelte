<script lang="ts">
  export let shift: number;
  export let min = 0;
  export let max: number;
</script>

<div class="overlaypos">
  <div class="shift">
    <button on:click={() => (shift = Math.max(min, shift - 35))}>5 weeks back</button>
    <button on:click={() => (shift = Math.max(min, shift - 7))}>1 week back</button>
    <button on:click={() => (shift = Math.max(min, shift - 1))}>1 day back</button>
    <span>{shift === 0 ? "0" : shift > 0 ? `${shift} days ahead` : `${shift} days back`}</span>
    <button on:click={() => (shift = Math.min(max, shift + 1))}>1 day forward</button>
    <button on:click={() => (shift = Math.min(max, shift + 7))}>1 week forward</button>
    <button on:click={() => (shift = Math.min(max, shift + 35))}>5 weeks forward</button>
  </div>
  <div class="presets">
    <span>Presets:</span>
    <div>
      <button on:click={() => (shift = 385)}>Similar trend year ago</button>
    </div>
  </div>
</div>

<style>
  .shift {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.2rem 0.4rem;
  }
  .shift span {
    align-self: center;
    text-align: center;
  }
  .shift > * {
    font-size: 0.8rem;
  }
  .presets {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0 0.5rem;
    margin-top: 0.2rem;
  }
  .presets > div {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 0.2rem;
  }
</style>
