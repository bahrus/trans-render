import {PEUnionSettings, PSettings} from './types.d.js';
import {applyP} from './applyP.js';
import { getProp } from './getProp.js';

export async function applyPE<T extends Partial<HTMLElement> = HTMLElement>(host: Element, target: Element, pe: PEUnionSettings<T>) {
    applyP(target, pe as PSettings<T>);
    const eventSettings = pe[1];
    if (eventSettings !== undefined) {
        for (const key in eventSettings) {
            let eventHandler = eventSettings[key];
            if (eventHandler === undefined) throw "Missing " + key;
            if (Array.isArray(eventHandler)) {
                const objSelector = eventHandler[1];
                const converter = eventHandler[2];
                let handler = eventHandler[0];
                if(typeof(handler) === 'string') handler = (<any>host)[handler] as Function;
                const originalEventHandler = handler.bind(host); //do we need bind?
                eventHandler = (e: Event) => {
                    let val: any;
                    if(objSelector !== undefined){
                        const objSelectorPath = objSelector.split('.');
                        val = getProp(e.target, objSelectorPath);
                        if (converter !== undefined){
                            switch(typeof converter){
                                case 'string':
                                    val = (<any>self)[converter](val);
                                    break;
                                case 'function':
                                    val = converter(val);
                                    break;
                            }
                        }
                    }  
                    originalEventHandler(host, val, e);
                }
            } else {
                switch(typeof eventHandler){
                    case 'function':
                        eventHandler = eventHandler.bind(host);
                        break;
                    case 'object': {
                        const props = eventHandler;
                        eventHandler = (e: Event) => {
                            applyP(host, [props] as PSettings<T>);
                        }
                        break;
                    }
                }
                
            }
            target.addEventListener(key, eventHandler as EventListenerOrEventListenerObject);
        }
    }
}