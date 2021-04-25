import { applyP } from './applyP.js';
import { getProp } from './getProp.js';
export function applyPE(host, target, pe) {
    applyP(target, pe);
    const eventSettings = pe[1];
    if (eventSettings !== undefined) {
        for (const key in eventSettings) {
            let eventHandler = eventSettings[key];
            if (eventHandler === undefined)
                throw "Missing " + key;
            if (Array.isArray(eventHandler)) {
                const objSelectorPath = eventHandler[1].split('.');
                const converter = eventHandler[2];
                const originalEventHandler = eventHandler[0].bind(host);
                eventHandler = (e) => {
                    let val = getProp(e.target, objSelectorPath);
                    if (converter !== undefined)
                        val = converter(val);
                    originalEventHandler(val, e);
                };
            }
            else {
                switch (typeof eventHandler) {
                    case 'function':
                        eventHandler = eventHandler.bind(host);
                        break;
                    case 'object': {
                        const props = eventHandler;
                        eventHandler = (e) => {
                            if (e.target !== null)
                                applyP(host, props);
                        };
                        break;
                    }
                }
            }
            target.addEventListener(key, eventHandler);
        }
    }
}
