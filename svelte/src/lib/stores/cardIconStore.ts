import { writable } from 'svelte/store';

function createCardIconStore() {
	const { subscribe, set, update } = writable<Record<string, boolean>>({});

	return {
		subscribe,
		set,
		update,
		reset: () => set({})
	};
}

export const cardIconStore = createCardIconStore();
