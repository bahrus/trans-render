import {Busses, Compacts, ICompact, Operation, RoundaboutReady} from './types';

export class Compact implements ICompact{
    #compactions : Compactions = {};
    constructor(public compacts: Compacts){
        const compactions = this.#compactions;
        for(const key in compacts){
            const split = key.split('_to_');
            const [src, dest] = split;
            const rhs = (<any>compacts)[key] as Operation;
            switch(typeof rhs){
                case 'string':
                    switch(rhs){
                        case 'negate':
                            compactions[src] = {
                                fn: vm => ({
                                    [dest]: !vm[src]
                                })
                            }
                    }
                    break;
            }
        }
    }
    async assignCovertly(obj: any, vm: RoundaboutReady, keysToPropagate: Set<string>, busses: Busses) {
        const compactions = this.#compactions;
        for(const vmKey in obj){
            if(vmKey in compactions){
                const compaction = compactions[vmKey];
                const result = compaction.fn(obj);
                vm.covertAssignment(result);
                for(const resultKey in result){
                    keysToPropagate.add(resultKey);
                    for(const busKey in busses){
                        const bus = busses[busKey];
                        bus.add(resultKey);
                    }
                }
            }
        }
    }
}



interface Compaction{
    fn: (obj: any) => any
}

type Compactions = {[key: string] : Compaction};