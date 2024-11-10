import { set } from './set.js';
export async function stow(values, mapping) {
    for (const key in mapping) {
        await set(mapping[key], values[key]);
    }
}
