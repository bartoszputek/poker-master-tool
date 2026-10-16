<script lang="ts">
	import {
		BOARD_INDEX,
		BOARD_SIZE,
		Calculator,
		DEATH_CARDS_INDEX,
		MAX_DEATH_CARDS,
		PLAYERS_COUNT
	} from '#lib/calculator.svelte.ts';
	import CardSlot from '#lib/components/CardSlot.svelte';
	import Menu from '#lib/components/Menu.svelte';
	import PlayerSeat from '#lib/components/PlayerSeat.svelte';
	import Results from '#lib/components/Results.svelte';

	const calculator = new Calculator();

	const range = (length: number): number[] => Array.from({ length }, (_, i) => i);
</script>

<div class="app">
	<Menu {calculator} />
	<div class="board-container">
		{#each range(PLAYERS_COUNT) as index (index)}
			<PlayerSeat {calculator} {index} />
		{/each}
		<div class="board">
			{#each range(BOARD_SIZE) as i (i)}
				<CardSlot
					label="Board card {i + 1}"
					card={calculator.slotCard(BOARD_INDEX + i)}
					selected={calculator.cursor === BOARD_INDEX + i}
					onclick={() => calculator.selectSlot(BOARD_INDEX + i)}
				/>{' '}
			{/each}
		</div>
	</div>
	<div class="death-cards-container">
		<h2>Death cards</h2>
		<div class="death-cards">
			{#each range(MAX_DEATH_CARDS) as i (i)}
				<CardSlot
					label="Death cards card {i + 1}"
					card={calculator.slotCard(DEATH_CARDS_INDEX + i)}
					selected={calculator.cursor === DEATH_CARDS_INDEX + i}
					onclick={() => calculator.selectSlot(DEATH_CARDS_INDEX + i)}
				/>{' '}
			{/each}
		</div>
	</div>
	<Results {calculator} />
	<div class="version">v{__APP_VERSION__}</div>
</div>
