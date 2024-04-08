export class Compact {
    compacts;
    vm;
    #compactions = {};
    constructor(compacts, vm) {
        this.compacts = compacts;
        this.vm = vm;
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
                                    [dest]: (vm[dest] || 0) + 1
                                })
                            };
                            break;
                        case 'dec':
                            compactions[src] = {
                                fn: vm => ({
                                    [dest]: (vm[dest] || 0) - 1
                                })
                            };
                            break;
                        case 'toggle':
                            compactions[src] = {
                                fn: vm => {
                                    const destVal = vm[dest];
                                    switch (typeof destVal) {
                                        case 'number':
                                            return {
                                                [dest]: -destVal,
                                            };
                                        //case 'boolean':
                                        default:
                                            return {
                                                [dest]: !destVal
                                            };
                                    }
                                }
                            };
                            break;
                        case 'length':
                            compactions[src] = {
                                fn: vm => ({
                                    [dest]: vm[src]?.length || 0,
                                })
                            };
                            break;
                        case 'toLocale':
                            compactions[src] = {
                                fn: vm => {
                                    const srcVal = vm[src];
                                    if (srcVal instanceof Date) {
                                        return {
                                            [dest]: srcVal.toLocaleDateString()
                                        };
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
                            break;
                    }
                    break;
                case 'object': {
                    this.#doComplexCompact(rhs, vm, src, dest);
                }
            }
        }
    }
    async #doComplexCompact(compact, vm, src, dest) {
        const { op } = compact;
        switch (op) {
            case 'echo':
                const { EchoCompact } = await import('./EchoCompact.js');
                //TODO work out aborting the listeners on disconnect
                //propagator needs a dispose event
                const echoCompact = new EchoCompact(src, dest, compact, vm);
        }
    }
    async covertAssignment(obj, vm, keysToPropagate, busses) {
        const compactions = this.#compactions;
        for (const vmKey in obj) {
            if (vmKey in compactions) {
                const compaction = compactions[vmKey];
                const result = compaction.fn(vm);
                //console.log({result});
                vm.covertAssignment(result);
                await this.covertAssignment(result, vm, keysToPropagate, busses);
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
