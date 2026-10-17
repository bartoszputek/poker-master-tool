<script lang="ts">
  import { cardImage } from '#lib/cards.ts';

  interface Props {
    label: string;
    card: string | null;
    selected: boolean;
    onclick: () => void;
  }

  let { label, card, selected, onclick }: Props = $props();
</script>

<button
  aria-label={label}
  class="card"
  class:selected
  style:background-image={card ? cardImage(card) : undefined}
  {onclick}
></button>
