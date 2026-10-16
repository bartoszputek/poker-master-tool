<script lang="ts">
  import { PLAYERS_COUNT, type Calculator, type HandType } from '#lib/calculator.svelte.ts';

  let { calculator }: { calculator: Calculator } = $props();

  const HANDS: [HandType, string][] = [
    ['highCard', 'High card'],
    ['onePair', 'One pair'],
    ['twoPair', 'Two pairs'],
    ['trips', 'Three of a Kind'],
    ['straight', 'Straight'],
    ['flush', 'Flush'],
    ['fullHouse', 'Full house'],
    ['quads', 'Quads'],
    ['straightFlush', 'Straight flush'],
  ];

  const players = Array.from({ length: PLAYERS_COUNT }, (_, i) => i);

  function percentage(hand: HandType, playerIndex: number): string {
    const results = calculator.results;
    const player = results?.players[playerIndex];

    if (!results || !player) {
      return '0.00%';
    }

    return `${((player.handTypes[hand] * 100) / results.combinations).toFixed(2)}%`;
  }
</script>

<div class="results">
  <h2>Results</h2>
  <div class="combinations">
    Combinations: <span>{calculator.results?.combinations ?? 0}</span>
  </div>
  <div class="table-container">
    <table>
      <tbody>
        <tr>
          <td class="hand-cell-header">&nbsp;</td>
          {#each players as playerIndex (playerIndex)}
            <th>Player {playerIndex + 1}</th>
          {/each}
        </tr>
        {#each HANDS as [hand, name] (hand)}
          <tr>
            <th class="hand-cell-header">{name}</th>
            {#each players as playerIndex (playerIndex)}
              <td>{percentage(hand, playerIndex)}</td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
