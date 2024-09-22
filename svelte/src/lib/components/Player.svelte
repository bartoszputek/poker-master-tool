<script lang="ts">
	import Card from './Card.svelte';

	export let playerName: string = 'Player 1';

	export let firstCard: string | undefined;
	export let secondCard: string | undefined;
</script>

<section>
	<div>
		<Card value={firstCard} />
		<Card value={secondCard} />
	</div>
	<h4>{playerName}</h4>
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
