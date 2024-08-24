import { ASMR } from '../asmr.js';
export class Std extends EventTarget {
    ao;
    disconnectedSignal;
    #so;
    #propagator;
    constructor(sourceEl, ao, 
    //public so: SharingObject,
    disconnectedSignal) {
        super();
        this.ao = ao;
        this.disconnectedSignal = disconnectedSignal;
    }
    handleEvent(e) {
        this.dispatchEvent(new Event('value'));
    }
    async getValue(el) {
        const { isRA, } = this.ao;
        if (isRA) {
        }
        if (this.#so !== undefined) {
            return this.#so.pureValue;
        }
    }
    async readMind(sourceEl) {
        const { localName } = sourceEl;
        const ao = this.ao;
        if (localName.includes('-')) {
            await customElements.whenDefined(localName);
            const propagator = sourceEl.propagator;
            if (propagator instanceof EventTarget) {
                ao.isRA = true;
                let { propToAbsorb, propToAbsorbValueType } = ao;
                if (propToAbsorb === undefined) {
                    propToAbsorb = ASMR.getValueProp(sourceEl, propToAbsorbValueType);
                }
            }
            else {
                throw 'NI';
            }
        }
        //this.dispatchEvent(new Event('readMind'));
    }
    #ac;
    async hydrate(sourceEl, ao) {
        const { propToAbsorbValueType } = ao;
        if (propToAbsorbValueType !== undefined) {
            const propagator = this.#propagator;
            if (propagator !== undefined) {
                const ac = new AbortController();
                propagator.addEventListener(propToAbsorbValueType, this, { signal: ac.signal });
                this.#ac = ac;
            }
            else {
                throw 'NI';
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
