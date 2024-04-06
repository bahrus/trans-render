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
        const members = new Set<string>();
        const{vm} = this;
        for(const key in vm){
            if((<any>vm)[key] !== undefined){
                members.add(key);
            }
        }
        const busses = this.#busses;
        for(const key in busses){
            busses[key] = (<any>busses[key]).union(members);
        }
        const {propagator} = vm;
        if(propagator !== undefined){
            propagator
        }
    }
}

export class ActionBus{
    bus = new Set<string>();
}