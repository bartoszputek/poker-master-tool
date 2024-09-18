<script lang="ts">
	import CardIcon from '$lib/components/CardIcon.svelte';

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
</script>

{#each CARD_SUITS as suit}
	{#each CARD_RANKS as rank}
		<CardIcon value={`${rank}${suit}`}></CardIcon>
	{/each}
{/each}

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
