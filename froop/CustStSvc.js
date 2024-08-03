import { EventHandler } from '../EventHandler.js';
class Reflect extends EventHandler {
    instance;
    internals;
    propName;
    handleEvent() {
        const instance = this.instance;
        const propName = this.propName;
        const internals = this.internals;
        const val = instance[propName];
        const method = val ? 'add' : 'delete';
        internals.states[method](propName);
    }
}
export class CustStSvc {
    customStatesToReflect;
    #acs = [];
    constructor(instance, internals, customStatesToReflect) {
        this.customStatesToReflect = customStatesToReflect;
        this.#do(instance, internals);
    }
    async #do(instance, internals) {
        const splitSplit = this
            .customStatesToReflect
            .split(',')
            .map(s => s.trim().split(' if ').map(t => t.trim()));
        const simpleOnes = splitSplit.filter(x => x.length === 1);
        const { propagator } = instance;
        //Use flatten?
        for (const propName of simpleOnes.map(x => x[0])) {
            const ac = new AbortController();
            this.#acs.push(ac);
            const reflector = new Reflect(this);
            Object.assign(reflector, { instance, internals, propName });
            reflector.sub(propagator, propName, { signal: ac.signal });
            reflector.handleEvent();
        }
        EventHandler.new(this, this.#disconnect).sub(propagator, 'disconnectedCallback', { once: true });
        const complexOnes = splitSplit.filter(x => x.length > 1);
        if (complexOnes.length > 0) {
            const { CustStExt } = await import('./CustStExt.js');
            new CustStExt(instance, internals, this.customStatesToReflect, complexOnes);
        }
    }
    #disconnect() {
        for (const ac of this.#acs) {
            ac.abort();
        }
    }
}
