import { applyP } from './applyP.js';
import { getProp } from './getProp.js';
export async function applyPE(host, target, pe) {
    applyP(target, pe);
    const eventSettings = pe[1];
    if (eventSettings !== undefined) {
        for (const key in eventSettings) {
            let eventHandler = eventSettings[key];
            if (eventHandler === undefined)
                throw "Missing " + key;
            if (Array.isArray(eventHandler)) {
                const objSelector = eventHandler[1];
                const converter = eventHandler[2];
                let handler = eventHandler[0];
                if (typeof (handler) === 'string')
                    handler = host[handler];
                const originalEventHandler = handler.bind(host); //do we need bind?
                eventHandler = (e) => {
                    let val;
                    if (objSelector !== undefined) {
                        const objSelectorPath = objSelector.split('.');
                        val = getProp(e.target, objSelectorPath);
                        if (converter !== undefined) {
                            switch (typeof converter) {
                                case 'string':
                                    val = self[converter](val);
                                    break;
                                case 'function':
                                    val = converter(val);
                                    break;
                            }
                        }
                    }
                    originalEventHandler(host, val, e);
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
                            applyP(host, [props]);
                        };
                        break;
                    }
                }
            }
            target.addEventListener(key, eventHandler);
        }
    }
}
