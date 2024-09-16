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
        this.dispatchEvent(new Event('.'));
    }
    async getValue() {
        const el = this.#ref.deref();
        if (el === undefined)
            return undefined;
        const { isRAR, propToAbsorb, isUE, isRAE, sotaProp, selfIsVal, as } = this.ao;
        if (selfIsVal)
            return el;
        let val;
        if (sotaProp !== undefined) {
            val = el[sotaProp];
        }
        if (propToAbsorb !== undefined) {
            if (propToAbsorb.startsWith('?.')) {
                //TODO -- less string manipulation
                const dotDelimitedPath = propToAbsorb.replaceAll('?.', '.');
                const { getVal } = await import('../../lib/getVal.js');
                val = await getVal({ host: el }, dotDelimitedPath);
            }
            else {
                val = el[propToAbsorb];
            }
        }
        if (this.#so !== undefined) {
            val = this.#so.pureValue;
        }
        switch (as) {
            case 'boolean':
            case 'number':
            case 'boolean|number':
                val = JSON.parse(val);
                break;
        }
        return val;
    }
    async readMind(sourceEl) {
        const { localName } = sourceEl;
        const ao = this.ao;
        const isBuiltInEditable = builtInEditables.includes(localName);
        const { propToAbsorb, propToAbsorbValueType } = ao;
        const p2aUn = propToAbsorb === undefined;
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
                if (p2aUn) {
                    ao.propToAbsorb = ASMR.getValueProp(sourceEl, propToAbsorbValueType);
                }
            }
            else {
                const { beRR, props } = await import('../../froop/beRR.js');
                const ret = beRR(sourceEl);
                console.log({ ret });
                if (ret) {
                    ao.isRAE = true;
                    this.#propagator = sourceEl[props[0]];
                    if (p2aUn) {
                        ao.propToAbsorb = ASMR.getValueProp(sourceEl, propToAbsorbValueType);
                    }
                    sourceEl[props[2]](ao.propToAbsorb);
                }
                else {
                    throw 'NI';
                }
            }
        }
        else {
            switch (localName) {
                case 'data':
                    ao.as = ao.as || 'boolean|number';
                case 'output':
                    if (p2aUn) {
                        ao.sota = 'value';
                    }
                    break;
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
        const { propToAbsorb, isUE, evt, sota } = ao;
        if (sota !== undefined) {
            const { hac } = await import('../../lib/hac.js');
            hac(sourceEl, sota, this);
            return;
        }
        const propagator = this.#propagator;
        if (propToAbsorb !== undefined && propagator !== undefined) {
            const ac = new AbortController();
            propagator.addEventListener(propToAbsorb, this, { signal: ac.signal });
            this.#ac = ac;
            return;
        }
        if (evt !== undefined) {
            const ac = new AbortController();
            sourceEl.addEventListener(evt, this, { signal: ac.signal });
            this.#ac = ac;
            return;
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
