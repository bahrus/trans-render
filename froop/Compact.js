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
    async assignCovertly(obj, keysToPropagate, busses) {
        throw 'NI';
    }
}
