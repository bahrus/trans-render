export async function roundabout(vm, options) {
    const ra = new RoundAbout(vm, options);
    await ra.init();
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
    async init() {
        // const members = new Set<string>();
        // const{vm} = this;
        // for(const key in vm){
        //     if((<any>vm)[key] !== undefined){
        //         members.add(key);
        //     }
        // }
        // const busses = this.#busses;
        // for(const key in busses){
        //     busses[key] = (<any>busses[key]).union(members);
        // }
        // const {propagator} = vm;
        // if(propagator !== undefined){
        //     propagator
        // }
        const checks = this.#checks;
        const { vm } = this;
        for (const key in checks) {
            const check = checks[key];
            const checkVal = await this.doChecks(check, true);
            console.log({ checkVal });
            if (checkVal) {
                const method = vm[key];
                const isAsync = method.constructor.name === 'AsyncFunction';
                const ret = isAsync ? await vm[key](vm) : vm[key](vm);
                vm.covertAssignment(ret);
                console.log({ ret });
            }
        }
    }
    async doChecks(check, initCheck) {
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
}
export class ActionBus {
    bus = new Set();
}
