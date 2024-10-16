import { EventHandler } from '../EventHandler.js';
export async function roundabout(options, infractions) {
    const { vm } = options;
    const { sleep } = vm;
    if (sleep) {
        await vm?.awake();
    }
    const ra = new RoundAbout(options, infractions);
    const keysToPropagate = new Set();
    await ra.subscribe();
    await ra.init();
    await ra.hydrate(keysToPropagate);
    await ra.checkQ(keysToPropagate);
    return [ra.options.vm, ra];
}
export class DoKeyAndCheckQ {
    d;
    vm;
    ra;
    constructor(d, vm, ra) {
        this.d = d;
        this.vm = vm;
        this.ra = ra;
    }
    async handleEvent(e) {
        const { d, vm, ra } = this;
        const keysToPropagate = new Set();
        await ra.doKey(this.d, this.vm, keysToPropagate, e);
        await ra.checkQ(keysToPropagate);
    }
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
        //TODO:  memoize this whole logic, keyed off of options
        const { actions, handlers, positractions, compacts } = options;
        for (const key in actions) {
            newBusses[key] = new Set();
            const val = actions[key];
            if (val === undefined)
                continue;
            const { ifAllOf, ifAtLeastOneOf, ifEquals, ifKeyIn, ifNoneOf, debug, delay } = val;
            const check = { delay, debug };
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
        if (handlers !== undefined) {
            //TODO:  maybe this could be done more globally on static properties, since it will 
            //repeat per instance
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
        if (positractions !== undefined) {
            const { options } = this;
            const { vm } = options;
            const infractionLookup = this.#infractionsLookup;
            for (const positraction of positractions) {
                const { ifKeyIn, ifAllOf, ifAtLeastOneOf, ifEquals, ifNoneOf, pass, do: d, assignTo, debug } = positraction;
                const passR = pass || ifKeyIn;
                if (passR === undefined)
                    throw 500;
                let fn;
                if (typeof d === 'string') {
                    fn = vm[d];
                }
                else {
                    fn = d;
                }
                const infraction = async (vm, e, ra) => {
                    const args = passR.map(key => {
                        if (typeof key !== 'string')
                            return key;
                        if (key.startsWith('`') && key.startsWith('`')) {
                            return key.substring(1, key.length - 1);
                        }
                        if (key in vm)
                            return vm[key];
                        //TODO:  work with scenarios where there is a container (element enhancement)
                        switch (key) {
                            case '$0':
                                return ra.options.container || vm;
                            case '$0+':
                                return vm;
                        }
                        return key;
                    });
                    const result = fn.apply(vm, args);
                    if (assignTo === undefined)
                        return;
                    if (!Array.isArray(result)) {
                        return {
                            [assignTo[0]]: result
                        };
                    }
                    const returnObj = {};
                    for (let i = 0, ii = Math.min(result.length, assignTo.length); i < ii; i++) {
                        const propToAssign = assignTo[i];
                        if (propToAssign === null)
                            continue;
                        returnObj[propToAssign] = result[i];
                    }
                    return returnObj;
                };
                let name = fn.name;
                while (name in vm || name in infractionLookup) {
                    name += '_';
                }
                infractionLookup[name] = infraction;
                newBusses[name] = new Set();
                const check = { debug };
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
                checks[name] = check;
            }
        }
        if (compacts !== undefined) {
            for (const key in compacts) {
                const parsedCompact = reInvoke.exec(key);
                if (parsedCompact !== null) {
                    const grps = parsedCompact.groups;
                    const { destKey, srcKey } = grps;
                    const check = {
                        ifKeyIn: new Set([srcKey]),
                    };
                    newBusses[destKey] = new Set();
                    checks[destKey] = check;
                }
                //console.log({tbd: parsedCompact});
            }
            //const invokingCompacts = Object.keys(compacts).filter(x => x.indexOf())
        }
    }
    async init() {
        //do optional stuff to improve the developer experience,
        // that involves importing references dynamically, like parsing arrow functions
        // create propagator, etc
        const checks = this.#checks;
        const busses = this.#busses;
        const { infractions, options } = this;
        const { vm, compacts, hitch } = options;
        if (infractions !== undefined) {
            const { getDestructArgs } = await import('../lib/getDestructArgs.js');
            const infractionsLookup = this.#infractionsLookup;
            for (const infraction of infractions) {
                let name = infraction.name;
                while (name in vm || name in infractionsLookup) {
                    name += '_';
                }
                infractionsLookup[name] = infraction;
                const args = getDestructArgs(infraction);
                busses[name] = new Set();
                checks[name] = {
                    ifKeyIn: new Set(args),
                };
            }
        }
        if (compacts !== undefined) {
            const { hydrateCompacts } = await import('./hydrateCompacts.js');
            await hydrateCompacts(compacts, this);
        }
        if (hitch !== undefined) {
            const { hydrateHitches } = await import('./hydrateHitches.js');
            await hydrateHitches(hitch, this);
        }
    }
    async hydrate(keysToPropagate) {
        //const clone = structuredClone(keysToPropagate);// new Set(keysToPropagate);
        const { options } = this;
        const { vm } = options;
        const { sleep } = vm;
        if (sleep)
            await vm.awake();
        // if(compacts !== undefined){
        //     const {Compact} = await import('./Compact.void');
        //     this.#compact = new Compact(compacts, vm);
        //     this.#compact.covertAssignment(vm, vm, keysToPropagate, this.#busses);
        // }
        const checks = this.#checks;
        for (const key in checks) {
            const check = checks[key];
            const { delay } = check;
            if (delay)
                throw 'NI';
            const checkVal = await this.#doChecks(check, true);
            check.a = checkVal;
            if (checkVal) {
                await this.doKey(key, vm, keysToPropagate);
            }
        }
        const routers = this.#routers;
        for (const routerKey in routers) {
            // 
            this.#wireUpRouter(this, { type: routerKey });
        }
    }
    async checkQ(keysToPropagate) {
        const { options } = this;
        const { vm } = options;
        const { sleep } = vm;
        if (sleep)
            await vm.awake();
        const busses = this.#busses;
        const checks = this.#checks;
        let didNothing = true;
        for (const busKey in busses) {
            const bus = busses[busKey];
            const check = checks[busKey];
            if (check !== undefined) {
                const { debug, delay } = check;
                if (debug)
                    debugger;
                if (delay)
                    throw 'NI';
                const isOfInterest = await this.#checkSubscriptions(check, bus);
                if (!isOfInterest) {
                    busses[busKey] = new Set();
                    continue;
                }
                const passesChecks = await this.#doChecks(check, false);
                check.a = passesChecks;
                if (!passesChecks) {
                    busses[busKey] = new Set();
                    continue;
                }
                didNothing = false;
                busses[busKey] = new Set();
                await this.doKey(busKey, vm, keysToPropagate);
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
    #handleRoundAboutEvent(self, e) {
        if (e instanceof RoundAboutEvent)
            return;
        self.#extEvtCount++;
        self.doCoreEvt(e.type, self.#extEvtCount);
    }
    async subscribe() {
        const { options } = this;
        const { vm } = options;
        const { propagator, disconnectedSignal } = vm;
        if (!(propagator instanceof EventTarget))
            return;
        disconnectedSignal.addEventListener('abort', () => {
            //do inline as long as no external variable access other than this, I think
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
            EventHandler.new(this, this.#handleRoundAboutEvent).sub(propagator, key, { signal });
        }
        const routers = this.#routers;
        for (const routerKey in routers) {
            const ac = new AbortController();
            controllers.push(ac);
            EventHandler.new(this, this.#wireUpRouter).sub(propagator, routerKey, { signal: ac.signal });
        }
    }
    #wireUpRouter(self, e) {
        const routerKey = e.type;
        const routers = self.#routers;
        const handlerControllers = self.#handlerControllers;
        const { options } = self;
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
                const dkacq = new DoKeyAndCheckQ(d, vm, self);
                dkacq.d = d;
                dkacq.vm = vm;
                evtTarget.addEventListener(on, dkacq, { signal: ac.signal });
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
        // if(this.#compact){
        //     const {options} = this;
        //     const {vm} = options;
        //     const compactKeysToPropagate = new Set<string>();
        //     this.#compact.covertAssignment({[key]: (<any>vm)[key]}, vm, compactKeysToPropagate, this.#busses);
        // }
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
        const { ifAllOf, ifKeyIn, ifAtLeastOneOf, ifEquals, ifNoneOf, debug } = check;
        if (debug)
            debugger;
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
                    isFirst = false;
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
    async doKey(key, vm, keysToPropagate, e) {
        //if(key.startsWith('dispatch')) debugger;
        const method = vm[key] || this.#infractionsLookup[key];
        const isAsync = method.constructor.name === 'AsyncFunction';
        const ret = isAsync ? await method.apply(vm, [vm, e, this]) : method.apply(vm, [vm, e, this]);
        const busses = this.#busses;
        busses[key] = new Set();
        if (ret === undefined || ret === null)
            return;
        const keys = Object.keys(ret).filter(key => ret[key] !== vm[key]);
        // if(this.#compact){
        //     this.#compact.covertAssignment(ret, vm as RoundaboutReady, keysToPropagate, this.#busses);
        // }
        vm.covertAssignment(ret);
        keys.forEach(returnKey => {
            keysToPropagate.add(returnKey);
            for (const busKey in busses) {
                const bus = busses[busKey];
                bus.add(returnKey);
            }
        });
    }
}
export const whenSrcKeyChanges = String.raw `^when_(?<srcKey>[\w]+)_changes_`;
const reInvoke = new RegExp(String.raw `${whenSrcKeyChanges}invoke_(?<destKey>[\w]+)`);
export class RoundAboutEvent extends Event {
}
// export class ActionBus{
//     bus = new Set<string>();
// }
