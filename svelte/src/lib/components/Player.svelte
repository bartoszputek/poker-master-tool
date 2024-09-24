<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{
		click: { cardIndex: number };
	}>();

	import type { IPlayer } from '../types';
	import Card from './Card.svelte';

	export let player: IPlayer;
</script>

<section>
	<div>
		<Card
			value={player.cards[0]}
			on:click={() => {
				dispatch('click', { cardIndex: 0 });
			}}
		/>
		<Card
			value={player.cards[1]}
			on:click={() => {
				dispatch('click', { cardIndex: 1 });
			}}
		/>
	</div>
	<h4>{player.name}</h4>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		align-items: center;

		width: 200px;
	}

	h4 {
		margin: 0;
	}
</style>
