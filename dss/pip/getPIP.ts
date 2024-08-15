import {PIP, GetPIPOptions} from '../../ts-refs/trans-render/dss/types.js';
import { RoundaboutReady } from '../../ts-refs/trans-render/froop/types.js';

export const sym = Symbol.for('X6fTibxRk0KqM9FSHfqktA');

let map: WeakMap<Element, PIP> = (<any>globalThis)[sym] as WeakMap<Element, PIP>;
if(map === undefined){
    map = new WeakMap<Element, PIP>();
    (<any>globalThis)[sym] = map;
}


export async function getPH(element: Element, options: GetPIPOptions){
    if(!map.has(element)){
        let {isRoundAboutReady, prop, evtName, sota} = options;
        if(isRoundAboutReady === undefined){
            options.isRoundAboutReady = isRoundAboutReady =  (<any>element).propagator instanceof EventTarget;
        }
        if(isRoundAboutReady){
            const {RA_PH} = await import('./RA_PIP.js');
            if(!map.has(element)) map.set(element, new RA_PH(options, element as any as  RoundaboutReady));
            
        }else{
            if(element instanceof HTMLInputElement){
                if(evtName === undefined){
                    options.evtName = 'input';
                }
                const {InputPH} = await import('./InputPIP.js');
                if(!map.has(element)) map.set(element, new InputPH(options, element));
            }else if(sota !== undefined){
                const {SotaPIP} = await import('./SotaPIP.js');
                if(prop === undefined){
                    const {lispToCamel} = await import('../../lib/lispToCamel.js');
                    if(options.prop === undefined) options.prop = lispToCamel(sota);
                }
                if(!map.has(element)) map.set(element, new SotaPIP(options, element));
            }else if(prop !== undefined && evtName !== undefined){
                throw 'NI'
            }else if(prop === undefined && evtName !== undefined){
                throw 'NI'
            }else if(prop !== undefined && evtName === undefined){
                throw 'NI'
            }else if(prop === undefined && evtName === undefined){
                throw 'NI'
            }
        }
    }
    if(!map.has(element)) throw 'NI';
    return map.get(element)!
}
