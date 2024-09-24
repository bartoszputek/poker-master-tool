<script lang="ts">
	const CARD_REVERSE = '2B';

	export let value: string | null;

	let cardValue: string;
	$: cardValue = value ?? CARD_REVERSE;

	export let width: number = 70;
	const height: number = width * 1.4;

	let isSelected: boolean = false;
</script>

<button aria-label={value} style="width:{width}px; height:{height}px;" class:isSelected on:click>
	<img alt="" src={`/images/cards/${cardValue.toUpperCase()}.svg`} />
</button>

<style>
	button {
		display: inline-block;
		padding: 0;
		margin: 2px;
		cursor: pointer;
		border: solid;
		border-width: 0px;
		border-radius: 4px;
	}

	button:hover {
		outline: 3px solid #9ecaed;
		box-shadow: 0 0 10px 1px #9ecaed;
	}

	img {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
