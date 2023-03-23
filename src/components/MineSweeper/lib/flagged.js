import { writable } from 'svelte/store';

// keeps track of the flagged mines
export const flagged = writable([]);