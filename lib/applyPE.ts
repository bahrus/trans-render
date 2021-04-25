import {PEUnionSettings, PSettings} from './types.d.js';
import {applyP} from './applyP.js';
import { getProp } from './getProp.js';

export function applyPE<T extends Partial<HTMLElement> = HTMLElement>(host: HTMLElement, target: HTMLElement, pe: PEUnionSettings<T>) {
    applyP(target, pe as PSettings<T>);
    const eventSettings = pe[1];
    if (eventSettings !== undefined) {
        for (const key in eventSettings) {
            let eventHandler = eventSettings[key];
            if (eventHandler === undefined) throw "Missing " + key;
            if (Array.isArray(eventHandler)) {
                const objSelectorPath = eventHandler[1].split('.');
                const converter = eventHandler[2];
                const originalEventHandler = eventHandler[0].bind(host);
                eventHandler = (e: Event) => {
                    let val = getProp(e.target, objSelectorPath);
                    if (converter !== undefined) val = converter(val);
                    originalEventHandler(val, e);
                }
            } else {
                switch(typeof eventHandler){
                    case 'function':
                        eventHandler = eventHandler.bind(host);
                        break;
                    case 'object': {
                        const props = eventHandler;
                        eventHandler = (e: Event) => {
                            if(e.target !== null) applyP(host, props as PSettings<T>);
                        }
                        break;
                    }
                }
                
            }
            target.addEventListener(key, eventHandler as EventListenerOrEventListenerObject);
        }
    }
}