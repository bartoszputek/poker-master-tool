<script lang="ts">
	export let value: string;

	export let width: number = 60;
	const height: number = width * 2.5;

	let isSelected: boolean = false;
</script>

<button
	aria-label={value}
	style="width:{width}px; height:{height}px;"
	class:isSelected
	on:click={() => {
		isSelected = !isSelected;
		console.log(isSelected);
	}}
>
	<img alt="" src={`/images/cards/${value.toUpperCase()}.svg`} />
</button>

<style>
	button {
		display: inline-block;
		padding: 0;
		margin: 5px;
		vertical-align: top;
		cursor: pointer;
		border: solid;
		border-width: 1px;
		border-radius: 12px;
		overflow: hidden;
	}

	.isSelected {
		opacity: 0.2;
		cursor: not-allowed;
	}

	button:hover {
		outline: 3px solid #9ecaed;
		box-shadow: 0 0 10px 1px #9ecaed;
	}

	img {
		display: block;
		margin: -2px 0px 0 -4px;
	}
</style>
