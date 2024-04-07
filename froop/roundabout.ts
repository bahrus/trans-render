import { none } from './none';
import {roundaboutOptions, RoundaboutReady, Busses, SetLogicOps, Checks, Keysh, ICompact, Infractions, PropsToPartialProps, Routers} from './types';

export async function roundabout<TProps = any, TActions = TProps>(
    options: roundaboutOptions<TProps, TActions>,
    infractions?: Infractions<TProps>
    ){
    const ra = new RoundAbout(options, infractions);
    const keysToPropagate = new Set<string>();
    await ra.subscribe();
    if(infractions){
        await ra.init();
    }
    
    await ra.hydrate(keysToPropagate);
    await ra.checkQ(keysToPropagate);
}

export class RoundAbout{
    #checks: Checks;
    #busses: Busses;
    #compact?: ICompact;
    #routers: Routers;
    #infractionsLookup: {[key: string]: PropsToPartialProps} = {};
    #handlerControllers: {[key: string]: AbortController} = {};
    #toSet(k: Keysh){
        if(Array.isArray(k)) return new Set(k);
        return new Set([k]);
    }
    constructor(public options: roundaboutOptions, public infractions?: Infractions){
        const newBusses : Busses = {};
        const routers: Routers = {};
        const checks: Checks = {};
        this.#checks = checks;
        this.#busses = newBusses;
        this.#routers = routers;
        const {actions, onsets, handlers} = options;
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
            if(ifKeyIn) check.ifKeyIn = this.#toSet(ifKeyIn);
            checks[key] = check;
        }
        for(const onsetKey in onsets){
            const split = onsetKey.split('_to_');
            const val = (<any>onsets)[onsetKey] as 0 | 1;
            const [prop, action] = split;
            if(checks[action] !== undefined){
                //need to put in the right bucket
                throw 'NI'
            }else{
                const check: SetLogicOps = {};
                const s = new Set([prop]);
                switch(val){
                    case 0:
                        check.ifEquals = s;
                        break;
                    case 1:
                        check.ifAllOf = s;
                        break;
                }
                newBusses[action] = new Set();
                checks[action] = check;
            }

        }
        if(handlers !== undefined){
            for(const handlerKey in handlers){
                const on = (<any>handlers)[handlerKey] as string;
                const split = handlerKey.split('_to_');
                const [prop, action_on] = split;
                let router = this.#routers[prop];
                if(router === undefined) {
                    router = [];
                    this.#routers[prop] = router;
                }
                const newRouter = {
                    full: handlerKey,
                    on,
                    do: action_on.substring(0, action_on.length - 3)
                };
                router.push(newRouter);
            }
        }
    }

    async init(){
        //do optional stuff to improve the developer experience,
        // that involves importing references dynamically, like parsing arrow functions
        // create propagator, etc
        const checks = this.#checks;
        const busses = this.#busses;
        const {infractions, options} = this;
        const {vm} = options;
        if(infractions !== undefined){
            const {getDestructArgs} = await import('../lib/getDestructArgs.js');
            for(const infraction of infractions){
                let name = infraction.name;
                while(name in vm){
                    name+= '_';
                }
                this.#infractionsLookup[name] = infraction;
                const args = getDestructArgs(infraction);
                busses[name] = new Set();
                checks[name] = {
                    ifKeyIn: new Set(args),
                }
            }
        }
    }

    async hydrate(keysToPropagate: Set<string>){
        const {options} = this;
        const {compacts, vm} = options;
        if(compacts !== undefined){
            const {Compact} = await import('./Compact.js');
            this.#compact = new Compact(compacts, vm);
            this.#compact.covertAssignment(vm, vm, keysToPropagate, this.#busses);
        }
        const checks = this.#checks;
        for(const key in checks){
            const check = checks[key];
            const checkVal = await this.#doChecks(check!, true);
            if(checkVal){
                await this.#doKey(key, vm, keysToPropagate);
            }
        }
        const routers = this.#routers;
        for(const routerKey in routers){
            // 
            this.#wireUpRouter(routerKey);
        }
    }

    async checkQ(keysToPropagate: Set<string>){
        const busses = this.#busses;
        const checks = this.#checks;
        const {options} = this;
        const {vm} = options;
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
            this.#propagate(keysToPropagate);
        }else{
            this.checkQ(keysToPropagate);
        }
    }

    #propagate(keysToPropagate: Set<string>){
        const {options} = this;
        const {vm} = options;
        const propagator = vm.propagator;
        if(propagator instanceof EventTarget){
            for(const key of keysToPropagate){
                const re = new RoundAboutEvent(key);
                propagator.dispatchEvent(re);
            }
        }
    }

    #controllers : Array<AbortController> = [];
    #extEvtCount = 0;
    async subscribe(){
        const {options} = this;
        const {vm} = options;
        const {propagator} = vm;
        if(!(propagator instanceof EventTarget)) return;
        propagator.addEventListener('unload', e => {
            this.#unsubscribe()
        }, {once: true});
        const checks = this.#checks;
        let keys = new Set<string>()
        for(const checkKey in checks){
            const check = checks[checkKey]!;
            const {ifAllOf, ifAtLeastOneOf, ifEquals, ifKeyIn, ifNoneOf} = check;
            keys = new Set([...keys, ...ifAllOf || [], ...ifAtLeastOneOf || [], ...ifEquals || [], ...ifKeyIn || [], ...ifNoneOf || []]);
        }
        const controllers = this.#controllers;
        for(const key of keys){
            const ac = new AbortController();
            controllers.push(ac);
            const signal = ac.signal;
            propagator.addEventListener(key, e => {
                if(e instanceof RoundAboutEvent) return;
                this.#extEvtCount++;
                this.doCoreEvt(key, this.#extEvtCount);
            }, {signal});
        }
        const routers = this.#routers;
        
        for(const routerKey in routers){
            const ac = new AbortController();
            controllers.push(ac);
            propagator.addEventListener(routerKey, e => {
                //const evtTarget = vm[routerKey];
                this.#wireUpRouter(routerKey);
            }, {signal: ac.signal});
        }
    }

    #wireUpRouter(routerKey: string){
        const routers = this.#routers;
        const handlerControllers = this.#handlerControllers;
        const {options} = this;
        const {vm} = options;
        const router = routers[routerKey];
        for(const route of router){
            const {do: d, full, on} = route;
            let ac = handlerControllers[full];
            if(ac !== undefined) ac.abort();
            const evtTarget = vm[routerKey];
            if(evtTarget instanceof EventTarget){
                ac = new AbortController();
                handlerControllers[full] = ac;
                evtTarget.addEventListener(on, e => {
                    const keysToPropage = new Set<string>();
                    this.#doKey(d, vm, keysToPropage, e);
                },  {signal: ac.signal});
            }
        }
    }

    async #unsubscribe(){
        for(const ac of this.#controllers){
            ac.abort();
        }
        const handlerControllers = this.#handlerControllers;
        for(const handlerKey in handlerControllers){
            const controller = handlerControllers[handlerKey];
            controller.abort();
        }
    }

    async doCoreEvt(key: string, evtCount: number){
        let compactKeysToPropagate: Set<string> | undefined;
        if(this.#compact){
            const {options} = this;
            const {vm} = options;
            const compactKeysToPropagate = new Set<string>();
            this.#compact.covertAssignment({[key]: (<any>vm)[key]}, vm, compactKeysToPropagate, this.#busses);
        }
        const busses = this.#busses;
        for(const busKey in busses){
            const bus = busses[busKey];
            bus.add(key);
        }
        if(evtCount !== this.#extEvtCount){
            if(compactKeysToPropagate !== undefined){
                this.#propagate(compactKeysToPropagate)
            }
            return;
        }
        this.#extEvtCount++;
        const keysToPropagate = compactKeysToPropagate || new Set<string>();
        await this.checkQ(keysToPropagate);
        console.log('key');
        const routes = this.#routers[key];
        if(routes !== undefined){
            throw 'NI';
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
        const {options} = this;
        const {vm} = options;
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

    async #doKey(key: string, vm: any, keysToPropagate: Set<string>, e?: Event){
        const method = vm[key] || this.#infractionsLookup[key];
        const isAsync = method.constructor.name === 'AsyncFunction';
        const ret = isAsync ? await method(vm, e) : method(vm, e);
        if(this.#compact){
            this.#compact.covertAssignment(ret, vm as RoundaboutReady, keysToPropagate, this.#busses);
        }
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

    }
}

export class RoundAboutEvent extends Event{}

// export class ActionBus{
//     bus = new Set<string>();
// }