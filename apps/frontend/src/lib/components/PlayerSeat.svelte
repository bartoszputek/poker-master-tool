<script lang="ts">
	import type { Calculator } from '#lib/calculator.svelte.ts';
	import CardSlot from './CardSlot.svelte';

	let { calculator, index }: { calculator: Calculator; index: number } = $props();

	const number = $derived(index + 1);
	const result = $derived(calculator.results?.players[index]);
</script>

<div class="player player-{number}">
	<div class="player-container">
		<div class="card-container">
			{#each [0, 1] as cardIndex (cardIndex)}
				{@const position = index * 2 + cardIndex}
				<CardSlot
					label="Player {number} card {cardIndex + 1}"
					card={calculator.slotCard(position)}
					selected={calculator.cursor === position}
					onclick={() => calculator.selectSlot(position)}
				/>{' '}
			{/each}
		</div>
		<div>Player {number}</div>
	</div>
	<div class="player-results" class:display-none={!result}>
		<div>Win: <span>{result?.results.win[1]}</span>%</div>
		<div>Lose: <span>{result?.results.lose[1]}</span>%</div>
		<div>Draw: <span>{result?.results.draw[1]}</span>%</div>
	</div>
</div>
