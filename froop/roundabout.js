export async function roundabout(options, infractions) {
    const ra = new RoundAbout(options, infractions);
    const keysToPropagate = new Set();
    await ra.subscribe();
    if (infractions) {
        await ra.init();
    }
    await ra.hydrate(keysToPropagate);
    await ra.checkQ(keysToPropagate);
}
export class RoundAbout {
    options;
    infractions;
    #checks;
    #busses;
    #compact;
    #routers;
    #infractionsLookup = {};
    #handlerControllers = {};
    #toSet(k) {
        if (Array.isArray(k))
            return new Set(k);
        return new Set([k]);
    }
    constructor(options, infractions) {
        this.options = options;
        this.infractions = infractions;
        const newBusses = {};
        const routers = {};
        const checks = {};
        this.#checks = checks;
        this.#busses = newBusses;
        this.#routers = routers;
        const { actions, onsets, handlers } = options;
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
        for (const onsetKey in onsets) {
            const split = onsetKey.split('_to_');
            const val = onsets[onsetKey];
            const [prop, action] = split;
            if (checks[action] !== undefined) {
                //need to put in the right bucket
                throw 'NI';
            }
            else {
                const check = {};
                const s = new Set([prop]);
                switch (val) {
                    case 0:
                        check.ifEquals = s;
                        break;
                    case 1:
                        check.ifAllOf = s;
                        break;
                }
                newBusses[action] = new Set();
                checks[action] = check;
            }
        }
        if (handlers !== undefined) {
            for (const handlerKey in handlers) {
                const on = handlers[handlerKey];
                const split = handlerKey.split('_to_');
                const [prop, action_on] = split;
                let router = this.#routers[prop];
                if (router === undefined) {
                    router = [];
                    this.#routers[prop] = router;
                }
                const newRouter = {
                    full: handlerKey,
                    on,
                    do: action_on.substring(0, action_on.length - 3)
                };
                router.push(newRouter);
            }
        }
    }
    async init() {
        //do optional stuff to improve the developer experience,
        // that involves importing references dynamically, like parsing arrow functions
        // create propagator, etc
        const checks = this.#checks;
        const busses = this.#busses;
        const { infractions, options } = this;
        const { vm } = options;
        if (infractions !== undefined) {
            const { getDestructArgs } = await import('../lib/getDestructArgs.js');
            for (const infraction of infractions) {
                let name = infraction.name;
                while (name in vm) {
                    name += '_';
                }
                this.#infractionsLookup[name] = infraction;
                const args = getDestructArgs(infraction);
                busses[name] = new Set();
                checks[name] = {
                    ifKeyIn: new Set(args),
                };
            }
        }
    }
    async hydrate(keysToPropagate) {
        const { options } = this;
        const { compacts, vm } = options;
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
        const routers = this.#routers;
        for (const routerKey in routers) {
            // 
            this.#wireUpRouter(routerKey);
        }
    }
    async checkQ(keysToPropagate) {
        const busses = this.#busses;
        const checks = this.#checks;
        const { options } = this;
        const { vm } = options;
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
        const { options } = this;
        const { vm } = options;
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
        const { options } = this;
        const { vm } = options;
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
                this.doCoreEvt(key, this.#extEvtCount);
            }, { signal });
        }
        const routers = this.#routers;
        for (const routerKey in routers) {
            const ac = new AbortController();
            controllers.push(ac);
            propagator.addEventListener(routerKey, e => {
                //const evtTarget = vm[routerKey];
                this.#wireUpRouter(routerKey);
            }, { signal: ac.signal });
        }
    }
    #wireUpRouter(routerKey) {
        const routers = this.#routers;
        const handlerControllers = this.#handlerControllers;
        const { options } = this;
        const { vm } = options;
        const router = routers[routerKey];
        for (const route of router) {
            const { do: d, full, on } = route;
            let ac = handlerControllers[full];
            if (ac !== undefined)
                ac.abort();
            let evtTarget = vm[routerKey];
            if (evtTarget instanceof WeakRef) {
                evtTarget = evtTarget.deref();
            }
            if (evtTarget instanceof EventTarget) {
                ac = new AbortController();
                handlerControllers[full] = ac;
                evtTarget.addEventListener(on, e => {
                    const keysToPropage = new Set();
                    this.#doKey(d, vm, keysToPropage, e);
                }, { signal: ac.signal });
            }
        }
    }
    async #unsubscribe() {
        for (const ac of this.#controllers) {
            ac.abort();
        }
        const handlerControllers = this.#handlerControllers;
        for (const handlerKey in handlerControllers) {
            const controller = handlerControllers[handlerKey];
            controller.abort();
        }
    }
    async doCoreEvt(key, evtCount) {
        let compactKeysToPropagate;
        if (this.#compact) {
            const { options } = this;
            const { vm } = options;
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
        console.log('key');
        const routes = this.#routers[key];
        if (routes !== undefined) {
            throw 'NI';
        }
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
        const { options } = this;
        const { vm } = options;
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
    async #doKey(key, vm, keysToPropagate, e) {
        const method = vm[key] || this.#infractionsLookup[key];
        const isAsync = method.constructor.name === 'AsyncFunction';
        const ret = isAsync ? await method(vm, e) : method(vm, e);
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
