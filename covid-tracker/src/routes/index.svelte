<script context="module" lang="ts">
  type AllData = Array<{
    date: Date;
    cases: number;
    cured: number;
    deaths: number;
    pcrTests: number;
    agTests: number;
    totalTests: number;
    curInfected: number;
    casesPerPcrTest: number;
  }>;
  export const ssr = false;
  export async function load({ fetch }: LoadInput): Promise<LoadOutput> {
    const res = await fetch(
      "https://onemocneni-aktualne.mzcr.cz/api/v2/covid-19/nakazeni-vyleceni-umrti-testy.min.json",
    );
    const data: {
      modified: string;
      data: Array<{
        datum: string;
        prirustkovy_pocet_nakazenych: number;
        prirustkovy_pocet_vylecenych: number;
        prirustkovy_pocet_umrti: number;
        prirustkovy_pocet_provedenych_testu: number;
        prirustkovy_pocet_provedenych_ag_testu: number;
      }>;
    } = await res.json();
    const { newarr } = data.data.reduce<{
      newarr: AllData;
      curInfected: number;
    }>(
      ({ newarr, curInfected }, nextData) => {
        curInfected +=
          nextData.prirustkovy_pocet_nakazenych -
          nextData.prirustkovy_pocet_umrti -
          nextData.prirustkovy_pocet_vylecenych;
        newarr.push({
          date: new Date(nextData.datum),
          cases: nextData.prirustkovy_pocet_nakazenych,
          cured: nextData.prirustkovy_pocet_vylecenych,
          deaths: nextData.prirustkovy_pocet_umrti,
          pcrTests: nextData.prirustkovy_pocet_provedenych_testu,
          agTests: nextData.prirustkovy_pocet_provedenych_ag_testu,
          totalTests:
            nextData.prirustkovy_pocet_provedenych_testu +
            nextData.prirustkovy_pocet_provedenych_ag_testu,
          curInfected,
          casesPerPcrTest:
            nextData.prirustkovy_pocet_nakazenych / nextData.prirustkovy_pocet_provedenych_testu,
        });
        return {
          newarr,
          curInfected,
        };
      },
      { newarr: [], curInfected: 0 },
    );
    console.log(newarr);
    return {
      props: {
        lastUpdate: new Date(data.modified),
        data: newarr,
      },
    };
  }
</script>

<script lang="ts">
  import ComparisonGraph from "$lib/ComparisonGraph.svelte";
  import { formatDate } from "$lib/utils";
  import type { LoadInput, LoadOutput } from "@sveltejs/kit";

  export let lastUpdate: Date;
  export let data: AllData;

  let displayValue: Exclude<keyof AllData[number], "date"> = "cases";
</script>

<p>Data last updated on: {formatDate(lastUpdate)} (All dates in CE(S)T)</p>
<p>
  <label
    >Display metric:
    <select bind:value={displayValue}>
      <option value="cases">New Cases</option>
      <option value="cured">Cured</option>
      <option value="deaths">Deaths</option>
      <option value="pcrTests">PCR Tests</option>
      <option value="agTests">Antigen Tests</option>
      <option value="totalTests">Total Tests</option>
      <option value="curInfected">Currently Infected</option>
      <option value="casesPerPcrTest">New Cases per PCR Test</option>
    </select>
  </label>
</p>

<ComparisonGraph data={data.map((x) => ({ date: x.date, number: x[displayValue] }))} />
