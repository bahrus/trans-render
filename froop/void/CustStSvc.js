export class CustStSvc {
    states;
    vm;
    internals;
    #abortControllers = [];
    constructor(states, vm, internals) {
        this.states = states;
        this.vm = vm;
        this.internals = internals;
        this.#do();
    }
    async #do() {
        const { vm, internals } = this;
        const { propagator } = vm;
        if (!(propagator instanceof EventTarget))
            return;
        propagator.addEventListener('disconnectedCallback', e => {
            this.#disconnect();
        }, { once: true });
        const { states } = this;
        for (const stateKey in states) {
            const state = states[stateKey];
            const { css } = state;
            const customStateObj = typeof css === 'string' ? {
                nameValue: css,
            } : css;
            propagator.addEventListener(stateKey, async (e) => {
                this.#doSetCustomState(stateKey, customStateObj);
            });
            this.#doSetCustomState(stateKey, customStateObj);
        }
    }
    async #doSetCustomState(stateKey, customStateObj) {
        const { nameValue, falsy, truthy } = customStateObj;
        const { vm, internals } = this;
        const nv = vm[stateKey];
        if (nameValue !== undefined) {
            if (nv !== undefined) {
                const { camelToLisp } = await import('../../lib/camelToLisp.js');
                const valAsLisp = camelToLisp(nv.toString());
                internals.states.add(`--${nameValue}-${valAsLisp}`);
            }
        }
        if (truthy) {
            const verb = nv ? 'add' : 'remove';
            internals.states[verb](`--${truthy}`);
        }
        if (falsy) {
            const verb = nv ? 'remove' : 'add';
            internals.states[verb](`--${falsy}`);
        }
    }
    #disconnect() {
        for (const ac of this.#abortControllers) {
            ac.abort();
        }
    }
}
