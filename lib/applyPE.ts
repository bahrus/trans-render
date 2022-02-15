import {PEUnionSettings, PSettings} from './types.d.js';
import {applyP} from './applyP.js';
//import { getProp } from './getProp.js';

export async function applyPE<T extends Partial<HTMLElement> = HTMLElement>(host: Element, target: Element, pe: PEUnionSettings<T>) {
    applyP(target, pe as PSettings<T>);
    const eventSettings = pe[1];
    if (eventSettings !== undefined) {
        for (const key in eventSettings) {
            let eventHandler = eventSettings[key];
            target.addEventListener(key, e => {
                
            });
        }
    }
}