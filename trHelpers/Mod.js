export class Mod {
    #abortController = new AbortController();
    constructor(mountObserver, transformer, matchingElement, m) {
        const { on } = m;
        const once = on === 'load';
        //I'm thinking there's no memory access issues here 
        //so keeping as a closure for now.
        matchingElement.addEventListener(on, async (e) => {
            const { inc, byAmt, s, toggle } = m;
            const { model, options } = transformer;
            //const {propagator} = options;
            //const isPropagating = !(model instanceof EventTarget) && propagator !== undefined;
            if (inc !== undefined) {
                let valToIncBy = 0;
                switch (typeof byAmt) {
                    case 'string':
                        if (byAmt[0] === '.') {
                            const { getVal } = await import('../lib/getVal.js');
                            const sVal = await getVal({ host: matchingElement }, byAmt);
                            valToIncBy = Number(sVal);
                        }
                        else {
                            valToIncBy = Number(matchingElement[byAmt]);
                        }
                        break;
                    case 'number':
                        throw 'NI';
                    default:
                        throw 'NI';
                }
                model[inc] += valToIncBy;
                // if(isPropagating){
                //     propagator.dispatchEvent(new Event(inc));
                // }
            }
            if (s !== undefined) {
                const { toValFrom, to } = m;
                let valToSet;
                if (toValFrom !== undefined) {
                    switch (typeof toValFrom) {
                        case 'string':
                            if (toValFrom[0] === '.') {
                                const { getVal } = await import('../lib/getVal.js');
                                valToSet = await getVal({ host: matchingElement }, toValFrom);
                            }
                            else {
                                valToSet = matchingElement[toValFrom];
                            }
                            break;
                        case 'function':
                            valToSet = toValFrom(matchingElement, transformer, m);
                            break;
                        default:
                            throw 'NI';
                    }
                }
                else {
                    throw 'NI';
                }
                (model[s]) = valToSet;
                // if(isPropagating){
                //     propagator.dispatchEvent(new Event(s));
                // }
            }
            if (toggle !== undefined) {
                model[toggle] = !model[toggle];
                // if(isPropagating){
                //     propagator.dispatchEvent(new Event(toggle));
                // }
            }
        }, {
            signal: this.#abortController.signal,
            once
        });
        if (on === 'load' && !transformer.initializedMods.has(m)) {
            //only do one time per selector
            matchingElement.dispatchEvent(new Event('load'));
            transformer.initializedMods.add(m);
        }
        //I'm thinking no shared memory access in this closure, so leaving as is.
        mountObserver?.addEventListener('disconnect', e => {
            this.#abortController.abort();
        });
    }
}
