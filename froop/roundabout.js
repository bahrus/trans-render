export async function roundabout(vm, options) {
    const ra = new RoundAbout(vm, options);
    const keysToPropagate = new Set();
    await ra.subscribe();
    await ra.init();
    await ra.hydrate(keysToPropagate);
    await ra.checkQ(keysToPropagate);
}
export class RoundAbout {
    vm;
    options;
    #checks;
    #busses;
    #compact;
    #toSet(k) {
        if (Array.isArray(k))
            return new Set(k);
        return new Set([k]);
    }
    constructor(vm, options) {
        this.vm = vm;
        this.options = options;
        const newBusses = {};
        const checks = {};
        this.#checks = {};
        this.#busses = {};
        const { actions, } = options;
        for (const key in actions) {
            newBusses[key] = new Set();
            const val = actions[key];
            if (val === undefined)
                continue;
            const { ifAllOf, ifAtLeastOneOf, ifEquals, ifKeyIn, ifNoneOf } = val;
            const check = {};
            if (ifAllOf)
                check.ifAllOf = this.#toSet(ifAllOf);
            if (ifAtLeastOneOf)
                check.ifAtLeastOneOf = this.#toSet(ifAtLeastOneOf);
            if (ifEquals)
                check.ifEquals = this.#toSet(ifEquals);
            if (ifNoneOf)
                check.ifNoneOf = this.#toSet(ifNoneOf);
            if (ifKeyIn)
                check.ifKeyIn = this.#toSet(ifKeyIn);
            checks[key] = check;
        }
    }
    async init() {
        //do optional stuff to improve the developer experience,
        // that involves importing references dynamically, like parsing arrow functions
        // create propagator, etc
    }
    async hydrate(keysToPropagate) {
        const { vm, options } = this;
        const { compacts } = options;
        if (compacts !== undefined) {
            const { Compact } = await import('./Compact.js');
            this.#compact = new Compact(compacts, vm);
            this.#compact.covertAssignment(vm, vm, keysToPropagate, this.#busses);
        }
        const checks = this.#checks;
        for (const key in checks) {
            const check = checks[key];
            const checkVal = await this.#doChecks(check, true);
            if (checkVal) {
                await this.#doKey(key, vm, keysToPropagate);
            }
        }
    }
    async checkQ(keysToPropagate) {
        const busses = this.#busses;
        const checks = this.#checks;
        const { vm } = this;
        let didNothing = true;
        for (const busKey in busses) {
            const bus = busses[busKey];
            for (const checkKey in checks) {
                const check = checks[checkKey];
                const isOfInterest = await this.#checkSubscriptions(check, bus);
                if (!isOfInterest) {
                    busses[busKey] = new Set();
                    continue;
                }
                const passesChecks = await this.#doChecks(check, false);
                if (!passesChecks) {
                    busses[busKey] = new Set();
                    continue;
                }
                didNothing = false;
                busses[busKey] = new Set();
                await this.#doKey(checkKey, vm, keysToPropagate);
            }
        }
        if (didNothing) {
            this.#propagate(keysToPropagate);
        }
        else {
            this.checkQ(keysToPropagate);
        }
    }
    #propagate(keysToPropagate) {
        const { vm } = this;
        const propagator = vm.propagator;
        if (propagator instanceof EventTarget) {
            for (const key of keysToPropagate) {
                const re = new RoundAboutEvent(key);
                propagator.dispatchEvent(re);
            }
        }
    }
    #controllers = [];
    #extEvtCount = 0;
    async subscribe() {
        const { vm } = this;
        const { propagator } = vm;
        if (!(propagator instanceof EventTarget))
            return;
        propagator.addEventListener('unload', e => {
            this.#unsubscribe();
        }, { once: true });
        const checks = this.#checks;
        let keys = new Set();
        for (const checkKey in checks) {
            const check = checks[checkKey];
            const { ifAllOf, ifAtLeastOneOf, ifEquals, ifKeyIn, ifNoneOf } = check;
            keys = new Set([...keys, ...ifAllOf || [], ...ifAtLeastOneOf || [], ...ifEquals || [], ...ifKeyIn || [], ...ifNoneOf || []]);
        }
        const controllers = this.#controllers;
        for (const key of keys) {
            const ac = new AbortController();
            controllers.push(ac);
            const signal = ac.signal;
            propagator.addEventListener(key, e => {
                if (e instanceof RoundAboutEvent)
                    return;
                this.#extEvtCount++;
                this.handleEvent(key, this.#extEvtCount);
            }, { signal });
        }
    }
    async #unsubscribe() {
        for (const ac of this.#controllers) {
            ac.abort();
        }
    }
    async handleEvent(key, evtCount) {
        let compactKeysToPropagate;
        if (this.#compact) {
            const { vm } = this;
            const compactKeysToPropagate = new Set();
            this.#compact.covertAssignment({ [key]: vm[key] }, vm, compactKeysToPropagate, this.#busses);
        }
        const busses = this.#busses;
        for (const busKey in busses) {
            const bus = busses[busKey];
            bus.add(key);
        }
        if (evtCount !== this.#extEvtCount) {
            if (compactKeysToPropagate !== undefined) {
                this.#propagate(compactKeysToPropagate);
            }
            return;
        }
        this.#extEvtCount++;
        const keysToPropagate = compactKeysToPropagate || new Set();
        await this.checkQ(keysToPropagate);
    }
    async #checkSubscriptions(check, bus) {
        const { ifAllOf, ifKeyIn, ifAtLeastOneOf, ifEquals, ifNoneOf } = check;
        if (ifAllOf !== undefined) {
            if (!bus.isDisjointFrom(ifAllOf))
                return true;
        }
        if (ifKeyIn !== undefined) {
            if (!bus.isDisjointFrom(ifKeyIn))
                return true;
        }
        if (ifAtLeastOneOf !== undefined) {
            if (!bus.isDisjointFrom(ifAtLeastOneOf))
                return true;
        }
        if (ifEquals !== undefined) {
            if (!bus.isDisjointFrom(ifEquals))
                return true;
        }
        if (ifNoneOf) {
            if (!bus.isDisjointFrom(ifNoneOf))
                return true;
        }
        return false;
    }
    async #doChecks(check, initCheck) {
        const { ifAllOf, ifKeyIn, ifAtLeastOneOf, ifEquals, ifNoneOf } = check;
        const { vm } = this;
        if (ifAllOf !== undefined) {
            for (const prop of ifAllOf) {
                if (!vm[prop])
                    return false;
            }
        }
        if (ifKeyIn !== undefined && initCheck) {
            let passed = false;
            for (const prop of ifKeyIn) {
                if (vm[prop] !== undefined) {
                    passed = true;
                    break;
                }
            }
            if (!passed)
                return false;
        }
        if (ifAtLeastOneOf !== undefined) {
            let passed = false;
            for (const prop of ifAtLeastOneOf) {
                if (vm[prop]) {
                    passed = true;
                    break;
                }
            }
            if (!passed)
                return false;
        }
        if (ifEquals !== undefined) {
            let isFirst = true;
            let firstVal;
            for (const prop of ifEquals) {
                const val = vm[prop];
                if (isFirst) {
                    firstVal = val;
                }
                else {
                    if (val !== firstVal)
                        return false;
                }
            }
        }
        if (ifNoneOf !== undefined) {
            for (const prop of ifNoneOf) {
                if (vm[prop])
                    return false;
            }
        }
        return true;
    }
    async #doKey(key, vm, keysToPropagate) {
        const method = vm[key];
        const isAsync = method.constructor.name === 'AsyncFunction';
        const ret = isAsync ? await vm[key](vm) : vm[key](vm);
        if (this.#compact) {
            this.#compact.covertAssignment(ret, vm, keysToPropagate, this.#busses);
        }
        vm.covertAssignment(ret);
        const keys = Object.keys(ret);
        const busses = this.#busses;
        keys.forEach(key => {
            keysToPropagate.add(key);
            for (const busKey in busses) {
                const bus = busses[busKey];
                bus.add(key);
            }
        });
    }
}
export class RoundAboutEvent extends Event {
}
// export class ActionBus{
//     bus = new Set<string>();
// }
