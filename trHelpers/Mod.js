export class Mod {
    #abortController = new AbortController();
    constructor(mountObserver, transformer, matchingElement, m) {
        const { on } = m;
        matchingElement.addEventListener(on, async (e) => {
            const { inc, byAmt, s, toggle } = m;
            const { model, propagator } = transformer;
            const isPropagating = !(model instanceof EventTarget) && propagator !== undefined;
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
                if (isPropagating) {
                    propagator.dispatchEvent(new Event(inc));
                }
            }
            if (s !== undefined) {
                const { toValFrom, to } = m;
                let valToSet;
                if (toValFrom !== undefined) {
                    if (toValFrom[0] === '.') {
                        const { getVal } = await import('../lib/getVal.js');
                        valToSet = await getVal({ host: matchingElement }, toValFrom);
                    }
                }
                else {
                    throw 'NI';
                }
                (model[s]) = valToSet;
                if (isPropagating) {
                    propagator.dispatchEvent(new Event(s));
                }
            }
            if (toggle !== undefined) {
                model[toggle] = !model[toggle];
                if (isPropagating) {
                    propagator.dispatchEvent(new Event(toggle));
                }
            }
        }, {
            signal: this.#abortController.signal
        });
        mountObserver.addEventListener('disconnect', e => {
            this.#abortController.abort();
        });
    }
}
