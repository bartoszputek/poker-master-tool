<script lang="ts">
	import CardIcon from '$lib/components/CardIcon.svelte';
	import Player from '../lib/components/Player.svelte';
	import GameState from '../lib/models/GameState';
	import { cardIconStore } from '../lib/stores/cardIconStore';

	export const CARD_SUITS: string[] = ['s', 'd', 'h', 'c'];
	export const CARD_RANKS: string[] = [
		'2',
		'3',
		'4',
		'5',
		'6',
		'7',
		'8',
		'9',
		't',
		'j',
		'q',
		'k',
		'a'
	];

	const gameState = new GameState();

	$: players = gameState.players;
</script>

{#each CARD_SUITS as suit}
	{#each CARD_RANKS as rank}
		<CardIcon
			value={`${rank}${suit}`}
			on:click={(e) => {
				const { value } = e.detail;
				gameState.setCard(value);

				players = gameState.players;
			}}
		></CardIcon>
	{/each}
{/each}

<button
	on:click={() => {
		console.log(JSON.stringify(players, null, 2));
		gameState.reset();

		cardIconStore.reset();

		players = gameState.players;
	}}
	>reset
</button>

<br />

{#each players as player, index}
	<Player
		{player}
		on:click={(e) => {
			console.log(e.detail);

			const { cardIndex } = e.detail;
			const currentCardValue = players[index].cards[cardIndex];

			if (currentCardValue) {
				players[index].cards[e.detail.cardIndex] = null;

				$cardIconStore[currentCardValue] = false;

				return;
			}
		}}
	/>
{/each}
