<script lang="ts">
  import type { Calculator } from '#lib/calculator.svelte.ts';
  import { CARDS, cardImage } from '#lib/cards.ts';

  let { calculator }: { calculator: Calculator } = $props();

  const SUIT_SIZE = 13;
  const rows = Array.from({ length: CARDS.length / SUIT_SIZE }, (_, i) =>
    CARDS.slice(i * SUIT_SIZE, (i + 1) * SUIT_SIZE),
  );
  // Two columns with two suit rows each.
  const columns = [rows.slice(0, 2), rows.slice(2, 4)];

  const icons: HTMLButtonElement[] = $state([]);
  let resetButton: HTMLButtonElement | undefined = $state();

  function addCard(card: string): void {
    if (calculator.addCard(card)) {
      focusNextIcon(CARDS.indexOf(card));
    }
  }

  // Moves the focus to the next visible card icon, else to the reset button.
  function focusNextIcon(index: number): void {
    const next = CARDS.findIndex((card, i) => i > index && !calculator.usedCards.has(card));

    (next === -1 ? resetButton : icons[next])?.focus();
  }
</script>

<div class="menu">
  <div class="card-picker">
    {#each columns as column, columnIndex (columnIndex)}
      <div class="card-picker-column">
        {#each column as row, rowIndex (rowIndex)}
          <div class="card-picker-row">
            {#each row as card (card)}
              <button
                bind:this={icons[CARDS.indexOf(card)]}
                aria-label={card}
                class="card-icon"
                class:hide={calculator.usedCards.has(card)}
                style:background-image={cardImage(card)}
                onclick={() => addCard(card)}
              ></button>{' '}
            {/each}
          </div>
        {/each}
      </div>
    {/each}
  </div>
  <button bind:this={resetButton} class="reset-button" onclick={() => calculator.reset()}>
    Reset
  </button>
</div>
