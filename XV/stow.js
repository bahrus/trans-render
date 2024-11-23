import { set } from './set.js';
export async function stow(values, mapping) {
    const ctx = {
        USLs: new Set()
    };
    for (const key in mapping) {
        await set(mapping[key], values[key], ctx);
    }
    window.postMessage([ctx.USLs]);
}
