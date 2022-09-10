import { P } from './P.js';

export const PropTargets = new WeakMap<EventTarget, Map<string, EventTarget>>();

export async function bePropagating(target: EventTarget, prop: string): Promise<EventTarget>{
    if(!PropTargets.has(target)){
        PropTargets.set(target, new Map<string, EventTarget>());
    }
    const map = PropTargets.get(target)!;
    if(map.has(prop)) return map.get(prop)!;
    const propagator = new Propagator();
    map.set(prop, propagator);
    await propagator.subscribe(target, prop);
    return propagator;
}

export class Propagator extends EventTarget{
    async subscribe(target: EventTarget, propName: string){
        const {subscribe} = await import('./subscribe2.js');
        subscribe(target, propName, this);
    }
}