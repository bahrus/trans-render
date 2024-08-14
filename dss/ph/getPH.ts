import {PHI, GetPHOptions} from '../../ts-refs/trans-render/dss/types';
import { RoundaboutReady } from '../../ts-refs/trans-render/froop/types.js';

export const sym = Symbol.for('X6fTibxRk0KqM9FSHfqktA');

let map: WeakMap<Element, PHI> = (<any>globalThis)[sym] as WeakMap<Element, PHI>;
if(map === undefined){
    map = new WeakMap<Element, PHI>();
    (<any>globalThis)[sym] = map;
}

export async function getPH(element: Element, options: GetPHOptions){
    if(!map.has(element)){
        let {isRoundAboutReady, prop, evtName} = options;
        if(isRoundAboutReady === undefined){
            options.isRoundAboutReady = isRoundAboutReady =  (<any>element).propagator instanceof EventTarget;
        }
        if(isRoundAboutReady && prop === undefined){
            if(prop === undefined){
                options.prop = prop = 'value';
            }if(evtName === undefined){
                options.evtName = prop;
            }
            const {RA_PH} = await import('./RA_PH.js');
            if(!map.has(element)) map.set(element, new RA_PH(options, element as any as  RoundaboutReady));
        }else if(element instanceof HTMLInputElement){
            const {InputPH} = await import('./InputPH.js');
            if(!map.has(element)) map.set(element, new InputPH(options, element));
        }
    }
    if(!map.has(element)) throw 'NI';
    return map.get(element)!
}
