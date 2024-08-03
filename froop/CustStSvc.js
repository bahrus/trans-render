class Reflect {
    instance;
    internals;
    propName;
    constructor(instance, internals, propName) {
        this.instance = instance;
        this.internals = internals;
        this.propName = propName;
    }
    handleEvent() {
        const { instance, internals, propName } = this;
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
            const reflector = new Reflect(instance, internals, propName);
            propagator.addEventListener(propName, reflector, { signal: ac.signal });
        }
        propagator.addEventListener('disconnectedCallback', e => {
            this.#disconnect();
        }, { once: true });
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
