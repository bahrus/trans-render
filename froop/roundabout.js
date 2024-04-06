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
        const members = new Set();
        const { vm } = this;
        for (const key in vm) {
            if (vm[key] !== undefined) {
                members.add(key);
            }
        }
        const busses = this.#busses;
        for (const key in busses) {
            busses[key] = busses[key].union(members);
        }
        const { propagator } = vm;
        if (propagator !== undefined) {
            propagator;
        }
    }
}
export class ActionBus {
    bus = new Set();
}
