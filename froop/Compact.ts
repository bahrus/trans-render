import {Busses, Compacts, ICompact, Operation} from './types';

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
    async assignCovertly(obj: any, keysToPropagate: Set<string>, busses: Busses) {
        throw 'NI'
    }
}



interface Compaction{
    fn: (obj: any) => any
}

type Compactions = {[key: string] : Compaction};