import { none } from './none';
import {roundaboutOptions, RoundaboutReady, Busses, SetLogicOps, Checks, Keysh} from './types';

export async function roundabout<TProps = any, TActions = TProps>(
    vm: TProps & TActions & RoundaboutReady, options: roundaboutOptions<TProps, TActions>){
    const ra = new RoundAbout(vm, options);
    const keysToPropagate = new Set<string>();
    await ra.init(keysToPropagate);
    await ra.checkQ(keysToPropagate);
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

    async init(keysToPropagate: Set<string>){
        const checks = this.#checks;
        const {vm} = this;
        for(const key in checks){
            const check = checks[key];
            const checkVal = await this.#doChecks(check!, true);
            console.log({checkVal})
            if(checkVal){
                await this.#doKey(key, vm, keysToPropagate);
            }
        }
    }

    async checkQ(keysToPropagate: Set<string>){
        const busses = this.#busses;
        const checks = this.#checks;
        const {vm} = this;
        let didNothing = true;
        for(const busKey in busses){
            const bus = busses[busKey];
            for(const checkKey in checks){
                const check = checks[checkKey];
                const isOfInterest = await this.#checkSubscriptions(check!, bus);
                if(!isOfInterest) {
                    busses[busKey] = new Set<string>();
                    continue;
                }
                const passesChecks = await this.#doChecks(check!, false);
                if(!passesChecks) {
                    busses[busKey] = new Set<string>();
                    continue;
                }
                didNothing = false;
                busses[busKey] = new Set<string>();
                await this.#doKey(checkKey, vm, keysToPropagate);
            }
        }
        if(didNothing){
            //time to propagate and call it a day
            throw 'NI';
        }else{
            this.checkQ(keysToPropagate);
        }
    }

    async #checkSubscriptions(check: SetLogicOps, bus: any): Promise<boolean>{
        const {ifAllOf, ifKeyIn, ifAtLeastOneOf, ifEquals, ifNoneOf} = check;
        if(ifAllOf !== undefined){
            if(!bus.isDisjointFrom(ifAllOf)) return true;
        }
        if(ifKeyIn !== undefined){
            if(!bus.isDisjointFrom(ifKeyIn)) return true;
        }
        if(ifAtLeastOneOf !== undefined){
            if(!bus.isDisjointFrom(ifAtLeastOneOf)) return true;
        }
        if(ifEquals !== undefined){
            if(!bus.isDisjointFrom(ifEquals)) return true;
        }
        if(ifNoneOf){
            if(!bus.isDisjointFrom(ifNoneOf)) return true;
        }
        return false;
    }



    async #doChecks(check: SetLogicOps, initCheck: boolean){
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

    async #doKey(key: string, vm: any, keysToPropagate: Set<string>){
        const method = vm[key];
        const isAsync = method.constructor.name === 'AsyncFunction';
        const ret = isAsync ? await vm[key](vm) : vm[key](vm);
        vm.covertAssignment(ret);
        const keys = Object.keys(ret);
        const busses = this.#busses;
        keys.forEach(key => {
            keysToPropagate.add(key);
            for(const busKey in busses){
                const bus = busses[busKey];
                bus.add(key);
            }
        });

        console.log({ret});
    }
}

export class ActionBus{
    bus = new Set<string>();
}