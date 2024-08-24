export class Std extends EventTarget {
    ao;
    so;
    disconnectedSignal;
    //#readMind = false;
    constructor(sourceEl, ao, so, disconnectedSignal) {
        super();
        this.ao = ao;
        this.so = so;
        this.disconnectedSignal = disconnectedSignal;
        this.readMind(sourceEl, ao);
    }
    handleEvent(e) {
        this.dispatchEvent(new Event('value'));
    }
    async getValue(el) {
        return this.so.pureValue;
    }
    async readMind(sourceEl, ao) {
        //this.#readMind = true;
        //this.dispatchEvent(new Event('readMind'));
    }
    #ac;
    async hydrate(sourceEl, ao) {
        const { localName } = sourceEl;
        const { valueProp } = ao;
        if (valueProp !== undefined) {
            if (localName.includes('-')) {
                await customElements.whenDefined(localName);
                const propagator = sourceEl.propagator;
                if (propagator instanceof EventTarget) {
                    const ac = new AbortController();
                    propagator.addEventListener(valueProp, this, { signal: ac.signal });
                    this.#ac = ac;
                }
                else {
                    throw 'NI';
                }
            }
        }
    }
    async deHydrate() {
        this.disconnectedSignal?.addEventListener('abort', e => {
            this.#ac?.abort();
        });
    }
}
