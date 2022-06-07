import {writable} from 'svelte/store';

export const token = writable(0);
export const logged = writable(false);
export const role  = writable("manager");