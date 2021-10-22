<script context="module" lang="ts">
  export const ssr = false;
  export async function load({ fetch }: LoadInput): Promise<LoadOutput> {
    const res = await fetch(
      "https://onemocneni-aktualne.mzcr.cz/api/v2/covid-19/nakazeni-vyleceni-umrti-testy.min.json",
    );
    const data = await res.json();
    return {
      props: {
        lastUpdate: new Date(data["modified"]),
        cases: data["data"].map((x: any) => ({
          date: new Date(x["datum"]),
          cases: x["prirustkovy_pocet_nakazenych"],
        })),
        tests: data["data"].map((x: any) => ({
          date: new Date(x["datum"]),
          cases:
            x["prirustkovy_pocet_provedenych_testu"] + x["prirustkovy_pocet_provedenych_ag_testu"],
        })),
      },
    };
  }
</script>

<script lang="ts">
  import ComparisonGraph from "$lib/ComparisonGraph.svelte";
  import type { LoadInput, LoadOutput } from "@sveltejs/kit";

  export let lastUpdate: Date;
  export let cases: Array<{ date: Date; cases: number }>;
  export let tests: Array<{ date: Date; cases: number }>;
</script>

<p>Data last updated on: {lastUpdate.toLocaleDateString()}</p>
<p>Infections:</p>
<ComparisonGraph pastDays={75} futureDays={45} data={cases} />
<p>Tests:</p>
<ComparisonGraph pastDays={75} futureDays={45} data={tests} />
