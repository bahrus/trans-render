import {Busses, Compacts, ComplexCompact, EchoBy, ICompact, Operation, RoundaboutReady} from './types';

export class Compact implements ICompact{
    #compactions : Compactions = {};
    constructor(public compacts: Compacts, public vm: RoundaboutReady){
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
                                fn: vm => {
                                    const srcVal = vm[src];
                                    switch(typeof srcVal){
                                        case 'number':
                                            return {
                                                [dest]: -srcVal,
                                            }
                                        case 'boolean':
                                            return {
                                                [dest]: !srcVal
                                            }
                                        
                                    }

                                }
                            }
                            break;
                        case 'echo':
                            compactions[src] = {
                                fn: vm => ({
                                    [dest]: vm[src]
                                })
                            }
                            break;
                        case 'inc':
                            compactions[src] = {
                                fn: vm => ({
                                    [dest]: vm[src] + 1
                                })
                            }
                            break;
                        case 'toggle':
                            compactions[src] = {
                                fn: vm => {
                                    const destVal = vm[dest];
                                    switch(typeof destVal){
                                        case 'number':
                                            return {
                                                [dest]: -destVal,
                                            }
                                        case 'boolean':
                                            return {
                                                [dest]: !destVal
                                            }
                                        
                                    }

                                }
                            }
                            break;
                        case 'dec':
                            compactions[src] = {
                                fn: vm => ({
                                    [dest]: vm[src] - 1
                                })
                            }
                            break;
                        case 'length':
                            compactions[src] = {
                                fn: vm => ({
                                    [dest]: vm[src]?.length || 0,
                                })
                            }
                            break;
                        case 'toLocale':
                            compactions[src] = {
                                fn: vm => {
                                    const srcVal = vm[src];
                                    if(srcVal instanceof Date){
                                        return srcVal.toLocaleDateString()
                                    }
                                    switch(typeof srcVal){
                                        case 'bigint':
                                        case 'number':
                                            return {
                                                [dest]: srcVal.toLocaleString(),
                                            }
                                        
                                    }

                                }
                            }
                            break;
                    }
                    break;
                case 'object': {
                    this.#doComplexCompact(rhs, vm, src, dest);
                }
            }
        }
    }
    async #doComplexCompact(compact: ComplexCompact, vm: RoundaboutReady, src: string, dest: string){
        const {op} = compact;
        switch(op){
            case 'echo':
                const {EchoCompact} = await import('./EchoCompact.js');
                //TODO work out aborting the listeners on disconnect
                //propagator needs a dispose event
                const echoCompact = new EchoCompact(src, dest, compact as EchoBy, vm);
        }
    }
    async covertAssignment(obj: any, vm: RoundaboutReady, keysToPropagate: Set<string>, busses: Busses) {
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