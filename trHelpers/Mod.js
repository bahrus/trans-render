export class Mod {
    #abortController = new AbortController();
    constructor(mountObserver, transformer, matchingElement, m) {
        const { on } = m;
        matchingElement.addEventListener(on, async (e) => {
            const { inc, byAmt } = m;
            const { model, propagator } = transformer;
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
                if (!(model instanceof EventTarget) && propagator !== undefined) {
                    propagator.dispatchEvent(new Event(inc));
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
