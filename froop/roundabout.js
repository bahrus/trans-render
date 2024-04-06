export async function roundabout(vm, options) {
    const ra = new RoundAbout(vm, options);
    const keysToPropagate = new Set();
    await ra.init(keysToPropagate);
    await ra.checkQ(keysToPropagate);
}
export class RoundAbout {
    vm;
    options;
    #checks;
    #busses;
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
        this.#checks = checks;
        this.#busses = newBusses;
        const { actions } = options;
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
            checks[key] = check;
        }
        console.log({ checks: this.#checks, busses: this.#busses });
    }
    async init(keysToPropagate) {
        const checks = this.#checks;
        const { vm } = this;
        for (const key in checks) {
            const check = checks[key];
            const checkVal = await this.#doChecks(check, true);
            console.log({ checkVal });
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
            //time to propagate and call it a day
            throw 'NI';
        }
        else {
            this.checkQ(keysToPropagate);
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
        console.log({ ret });
    }
}
export class ActionBus {
    bus = new Set();
}
