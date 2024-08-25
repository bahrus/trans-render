import { ASMR } from '../asmr.js';
export class StOut extends EventTarget {
    ao;
    disconnectedSignal;
    #so;
    #propagator;
    constructor(sourceEl, ao, disconnectedSignal) {
        super();
        this.ao = ao;
        this.disconnectedSignal = disconnectedSignal;
    }
    handleEvent(e) {
        this.dispatchEvent(new Event('value'));
    }
    async getValue(el) {
        const { isRAR, propToAbsorb } = this.ao;
        if (isRAR) {
            return el[propToAbsorb];
        }
        if (this.#so !== undefined) {
            return this.#so.pureValue;
        }
    }
    async readMind(sourceEl) {
        const { localName } = sourceEl;
        const ao = this.ao;
        const isBuiltInEditable = builtInEditables.includes(localName);
        if (isBuiltInEditable || sourceEl.hasAttribute('contentEditable')) {
            const { UEMR } = await import('./UEMR.js');
            UEMR(sourceEl, ao);
        }
        else if (localName.includes('-')) {
            await customElements.whenDefined(localName);
            const propagator = sourceEl.propagator;
            if (propagator instanceof EventTarget) {
                ao.isRAR = true;
                let { propToAbsorb, propToAbsorbValueType } = ao;
                if (propToAbsorb === undefined) {
                    ao.propToAbsorb = ASMR.getValueProp(sourceEl, propToAbsorbValueType);
                }
            }
            else {
                const {} = await ;
            }
        }
        //this.dispatchEvent(new Event('readMind'));
    }
    #ac;
    async hydrate(sourceEl) {
        const { ao } = this;
        const { propToAbsorb, isUE, UEEN } = ao;
        if (isUE && UEEN !== undefined) {
            const ac = new AbortController();
            sourceEl.addEventListener(UEEN, this, { signal: ac.signal });
            this.#ac = ac;
            return;
        }
        if (propToAbsorb !== undefined) {
            const propagator = this.#propagator;
            if (propagator !== undefined) {
                const ac = new AbortController();
                propagator.addEventListener(propToAbsorb, this, { signal: ac.signal });
                this.#ac = ac;
                return;
            }
            else {
                throw 'NI';
            }
        }
        throw 'NI';
    }
    async deHydrate() {
        this.disconnectedSignal?.addEventListener('abort', e => {
            this.#ac?.abort();
        });
    }
}
const builtInEditables = ['input', 'select', 'textarea'];
