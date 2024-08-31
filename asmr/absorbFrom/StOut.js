import { ASMR } from '../asmr.js';
export class StOut extends EventTarget {
    ao;
    disconnectedSignal;
    #so;
    #propagator;
    #ref;
    constructor(sourceEl, ao, disconnectedSignal) {
        super();
        this.ao = ao;
        this.disconnectedSignal = disconnectedSignal;
        this.#ref = new WeakRef(sourceEl);
    }
    handleEvent() {
        this.dispatchEvent(new Event('value'));
    }
    async getValue() {
        const el = this.#ref.deref();
        if (el === undefined)
            return undefined;
        const { isRAR, propToAbsorb, isUE, isRAE, sotaProp } = this.ao;
        if (sotaProp !== undefined) {
            return el[sotaProp];
        }
        if (propToAbsorb !== undefined) {
            if (propToAbsorb.startsWith('?.')) {
                //TODO -- less string manipulation
                const dotDelimitedPath = propToAbsorb.replaceAll('?.', '.');
                const { getVal } = await import('../../lib/getVal.js');
                return await getVal({ host: el }, dotDelimitedPath);
            }
            else {
                return el[propToAbsorb];
            }
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
        else if (localName === 'meta') {
            ao.sota = 'content';
        }
        else if (localName.includes('-')) {
            await customElements.whenDefined(localName);
            const propagator = sourceEl.propagator;
            if (propagator instanceof EventTarget) {
                this.#propagator = propagator;
                ao.isRAR = true;
                let { propToAbsorb, propToAbsorbValueType } = ao;
                if (propToAbsorb === undefined) {
                    ao.propToAbsorb = ASMR.getValueProp(sourceEl, propToAbsorbValueType);
                }
            }
            else {
                const { beRR, props } = await import('../../froop/beRR.js');
                const ret = beRR(sourceEl);
                if (ret) {
                    ao.isRAE = true;
                    let { propToAbsorb, propToAbsorbValueType } = ao;
                    this.#propagator = sourceEl[props[0]];
                    if (propToAbsorb === undefined) {
                        ao.propToAbsorb = ASMR.getValueProp(sourceEl, propToAbsorbValueType);
                    }
                    sourceEl[props[2]](ao.propToAbsorb);
                }
                else {
                    throw 'NI';
                }
            }
        }
        if (ao.sota !== undefined && ao.sotaProp === undefined) {
            ao.sotaProp = ao.sota;
        }
        //this.dispatchEvent(new Event('readMind'));
    }
    #ac;
    async hydrate(sourceEl) {
        const { ao } = this;
        const { propToAbsorb, isUE, UEEN, sota } = ao;
        if (sota !== undefined) {
            const { hac } = await import('../../lib/hac.js');
            hac(sourceEl, sota, this);
            return;
        }
        if (UEEN !== undefined) {
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
