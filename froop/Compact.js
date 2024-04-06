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
                                fn: vm => {
                                    const srcVal = vm[src];
                                    switch (typeof srcVal) {
                                        case 'number':
                                            return {
                                                [dest]: -srcVal,
                                            };
                                        case 'boolean':
                                            return {
                                                [dest]: !srcVal
                                            };
                                    }
                                }
                            };
                            break;
                        case 'echo':
                            compactions[src] = {
                                fn: vm => ({
                                    [dest]: vm[src]
                                })
                            };
                            break;
                        case 'inc':
                            compactions[src] = {
                                fn: vm => ({
                                    [dest]: vm[src] + 1
                                })
                            };
                        case 'toggle':
                            compactions[src] = {
                                fn: vm => {
                                    const destVal = vm[dest];
                                    switch (typeof destVal) {
                                        case 'number':
                                            return {
                                                [dest]: -destVal,
                                            };
                                        case 'boolean':
                                            return {
                                                [dest]: !destVal
                                            };
                                    }
                                }
                            };
                        case 'dec':
                            compactions[src] = {
                                fn: vm => ({
                                    [dest]: vm[src] - 1
                                })
                            };
                        case 'length':
                            compactions[src] = {
                                fn: vm => ({
                                    [dest]: vm[src]?.length() || 0
                                })
                            };
                        case 'toLocale':
                            compactions[src] = {
                                fn: vm => {
                                    const srcVal = vm[src];
                                    if (srcVal instanceof Date) {
                                        return srcVal.toLocaleDateString();
                                    }
                                    switch (typeof srcVal) {
                                        case 'bigint':
                                        case 'number':
                                            return {
                                                [dest]: srcVal.toLocaleString(),
                                            };
                                    }
                                }
                            };
                    }
                    break;
            }
        }
    }
    async assignCovertly(obj, vm, keysToPropagate, busses) {
        const compactions = this.#compactions;
        for (const vmKey in obj) {
            if (vmKey in compactions) {
                const compaction = compactions[vmKey];
                const result = compaction.fn(obj);
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
