<script lang="ts">
  import '#lib/styles/modern-normalize.css';
  import '#lib/styles/style.css';
  import '#lib/styles/board.css';
  import '#lib/styles/results.css';
  import '#lib/styles/menu.css';
  import type { LayoutProps } from './$types';

  let { children }: LayoutProps = $props();
</script>

{@render children()}
