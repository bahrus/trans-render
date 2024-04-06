import { none } from './none';
import {roundaboutOptions, RoundaboutReady, Busses, SetLogicOps, Checks, Keysh} from './types';

export async function roundabout<TProps = any, TActions = TProps>(
    vm: TProps & TActions & RoundaboutReady, options: roundaboutOptions<TProps, TActions>){
    const ra = new RoundAbout(vm, options);
    await ra.init();
}

export class RoundAbout{
    #checks: Checks;
    #busses: Busses;
    #toSet(k: Keysh){
        if(Array.isArray(k)) return new Set(k);
        return new Set([k]);
    }
    constructor(public vm: RoundaboutReady, public options: roundaboutOptions){
        const newBusses : Busses = {}
        const checks: Checks = {};
        this.#checks = checks;
        this.#busses = newBusses;
        const {actions} = options;
        for(const key in actions){
            newBusses[key] = new Set();
            const val = actions[key];
            if(val === undefined) continue;
            const {ifAllOf, ifAtLeastOneOf, ifEquals, ifKeyIn, ifNoneOf} = val;
            const check: SetLogicOps = {}
            if(ifAllOf) check.ifAllOf = this.#toSet(ifAllOf);
            if(ifAtLeastOneOf) check.ifAtLeastOneOf = this.#toSet(ifAtLeastOneOf);
            if(ifEquals) check.ifEquals = this.#toSet(ifEquals);
            if(ifNoneOf) check.ifNoneOf = this.#toSet(ifNoneOf);
            checks[key] = check;
        }
        console.log({checks: this.#checks, busses: this.#busses});
    }

    async init(){
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
        const {vm} = this;
        for(const key in checks){
            const check = checks[key];
            const checkVal = await this.doChecks(check!, true);
            console.log({checkVal})
            if(checkVal){
                const method = (vm as any)[key];
                const isAsync = method.constructor.name === 'AsyncFunction';
                const ret = isAsync ? await (<any>vm)[key](vm) : (<any>vm)[key](vm);
                vm.covertAssignment(ret);
                
                console.log({ret});
            }
        }

    }

    async doChecks(check: SetLogicOps, initCheck: boolean){
        const {ifAllOf, ifKeyIn, ifAtLeastOneOf, ifEquals, ifNoneOf} = check;
        const {vm} = this;
        if(ifAllOf !== undefined){
            for(const prop of ifAllOf){
                if(!(vm as any)[prop]) return false;
            }
        }
        if(ifKeyIn !== undefined && initCheck){
            let passed = false;
            for(const prop of ifKeyIn){
                if((vm as any)[prop] !== undefined){
                    passed = true;
                    break;
                }
            }
            if(!passed) return false;
        }
        if(ifAtLeastOneOf !== undefined){
            let passed = false;
            for(const prop of ifAtLeastOneOf){
                if((vm as any)[prop]){
                    passed = true;
                    break;
                }
            }
            if(!passed) return false;
        }
        if(ifEquals !== undefined){
            let isFirst = true;
            let firstVal: any;
            for(const prop of ifEquals){
                const val = (vm as any)[prop];
                if(isFirst){
                    firstVal = val;
                }else{
                    if(val !== firstVal) return false;
                }
            }
        }
        if(ifNoneOf !== undefined){
            for(const prop of ifNoneOf){
                if((vm as any)[prop]) return false;
            }
        }
        return true;
    }
}

export class ActionBus{
    bus = new Set<string>();
}