export const PropTargets = new WeakMap();
export async function bePropagating(target, prop) {
    if (!PropTargets.has(target)) {
        PropTargets.set(target, new Map());
    }
    const map = PropTargets.get(target);
    if (map.has(prop))
        return map.get(prop);
    const propagator = new Propagator();
    map.set(prop, propagator);
    await propagator.subscribe(target, prop);
    return propagator;
}
export class Propagator extends EventTarget {
    async subscribe(target, propName) {
        const { subscribe } = await import('./subscribe2.js');
        subscribe(target, propName, this);
    }
}
