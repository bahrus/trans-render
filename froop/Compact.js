export class Compact {
    compacts;
    #compactions = {};
    constructor(compacts) {
        this.compacts = compacts;
        const compactions = this.#compactions;
        for (const key in compacts) {
            const split = key.split('_to_');
            const [src, dest] = split;
            const rhs = compacts[key];
            switch (typeof rhs) {
                case 'string':
                    switch (rhs) {
                        case 'negate':
                            compactions[src] = {
                                fn: vm => ({
                                    [dest]: !vm[src]
                                })
                            };
                    }
                    break;
            }
        }
    }
    async assignCovertly(vm, keysToPropagate, busses) {
        const compactions = this.#compactions;
        for (const vmKey in vm) {
            if (vmKey in compactions) {
                const compaction = compactions[vmKey];
                const result = compaction.fn(vm);
                vm.covertAssignment(result);
                for (const resultKey in result) {
                    keysToPropagate.add(resultKey);
                    for (const busKey in busses) {
                        const bus = busses[busKey];
                        bus.add(resultKey);
                    }
                }
            }
        }
    }
}
