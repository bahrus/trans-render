import { ASMR } from '../asmr.js';
export class Std extends EventTarget {
    ao;
    disconnectedSignal;
    //#readMind = false;
    #so;
    #propagator;
    constructor(sourceEl, ao, 
    //public so: SharingObject,
    disconnectedSignal) {
        super();
        this.ao = ao;
        this.disconnectedSignal = disconnectedSignal;
        this.readMind(sourceEl, ao);
    }
    handleEvent(e) {
        this.dispatchEvent(new Event('value'));
    }
    async getValue(el) {
        if (this.#so !== undefined) {
            return this.#so.pureValue;
        }
    }
    async readMind(sourceEl, ao) {
        const { localName } = sourceEl;
        if (localName.includes('-')) {
            await customElements.whenDefined(localName);
            const propagator = sourceEl.propagator;
            if (propagator instanceof EventTarget) {
                ao.isRA = true;
                let { propToAbsorb, valueType } = ao;
                if (propToAbsorb === undefined) {
                    propToAbsorb = ASMR.getValueProp(sourceEl, valueType);
                }
            }
            else {
                throw 'NI';
            }
        }
        //this.#readMind = true;
        //this.dispatchEvent(new Event('readMind'));
    }
    #ac;
    async hydrate(sourceEl, ao) {
        const { valueProp } = ao;
        if (valueProp !== undefined) {
            const propagator = this.#propagator;
            if (propagator !== undefined) {
                const ac = new AbortController();
                propagator.addEventListener(valueProp, this, { signal: ac.signal });
                this.#ac = ac;
            }
        }
        else {
            throw 'NI';
        }
    }
    async deHydrate() {
        this.disconnectedSignal?.addEventListener('abort', e => {
            this.#ac?.abort();
        });
    }
}
