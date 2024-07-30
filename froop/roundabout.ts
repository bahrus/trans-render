import {roundaboutOptions, RoundaboutReady, Busses, SetLogicOps, Checks, Keysh, ICompact, Infractions, PropsToPartialProps, Routers, LogicOp} from './types';

export async function roundabout<TProps = any, TActions = TProps>(
    options: roundaboutOptions<TProps, TActions>,
    infractions?: Infractions<TProps>
    ){
    const {vm} = options;
    const {sleep} = vm!;
    if(sleep){
        await vm?.awake();
    }
    const ra = new RoundAbout(options, infractions);
    const keysToPropagate = new Set<string>();
    await ra.subscribe();
    
    await ra.init();
    
    await ra.hydrate(keysToPropagate);
    await ra.checkQ(keysToPropagate);
    return [ra.options.vm, ra];
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
        //TODO:  memoize this whole logic, keyed off of options
        const {actions, handlers, positractions, compacts} = options;
        for(const key in actions){
            newBusses[key] = new Set();
            const val = actions[key];
            if(val === undefined) continue;
            
            const {ifAllOf, ifAtLeastOneOf, ifEquals, ifKeyIn, ifNoneOf, debug, delay} = val;
            const check: SetLogicOps = {delay, debug};
            if(ifAllOf) check.ifAllOf = this.#toSet(ifAllOf);
            if(ifAtLeastOneOf) check.ifAtLeastOneOf = this.#toSet(ifAtLeastOneOf);
            if(ifEquals) check.ifEquals = this.#toSet(ifEquals);
            if(ifNoneOf) check.ifNoneOf = this.#toSet(ifNoneOf);
            if(ifKeyIn) check.ifKeyIn = this.#toSet(ifKeyIn);
            checks[key] = check;
        }

        if(handlers !== undefined){
            //TODO:  maybe this could be done more globally on static properties, since it will 
            //repeat per instance
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
        if(positractions !== undefined){
            const {options} = this;
            const {vm} = options;
            const infractionLookup = this.#infractionsLookup;
            for(const positraction of positractions){
                const {
                    ifKeyIn, ifAllOf, ifAtLeastOneOf, ifEquals, ifNoneOf,
                    pass, do: d, 
                    assignTo, debug} = positraction;
                const passR = pass || ifKeyIn;
                if(passR === undefined) throw 500;
                let fn: Function;
                if(typeof d === 'string'){
                    fn = vm[d] as Function;
                }else{
                    fn = d;
                }
                
                const infraction = async (vm: any, e: Event | undefined, ra: RoundAbout) => {
                    const args = passR.map(key => {
                        if(typeof key !== 'string') return key;
                        if(key.startsWith('`') && key.startsWith('`')){
                            return key.substring(1, key.length - 1);
                        }
                        if(key in vm) return vm[key];
                        //TODO:  work with scenarios where there is a container (element enhancement)
                        switch(key){
                            case '$0':
                                return ra.options.container || vm;
                            case '$0+':
                                return vm;
                        }
                        return key;
                    });

                    const result = fn.apply(vm, args);
                    if(assignTo === undefined) return;
                    if(!Array.isArray(result)){
                        return {
                            [assignTo[0]!]: result
                        }
                    }
                    const returnObj: any = {};
                    for(let i = 0, ii = Math.min(result.length, assignTo.length); i < ii; i++){
                        const propToAssign = assignTo[i];
                        if(propToAssign === null) continue;
                        returnObj[propToAssign] = result[i];
                    }
                    return returnObj;
                }
                let name = fn.name;
                while(name in vm || name in infractionLookup){
                    name+= '_';
                }
                infractionLookup[name] = infraction;
                newBusses[name] = new Set();

                const check: SetLogicOps = {debug}
                if(ifAllOf) check.ifAllOf = this.#toSet(ifAllOf);
                if(ifAtLeastOneOf) check.ifAtLeastOneOf = this.#toSet(ifAtLeastOneOf);
                if(ifEquals) check.ifEquals = this.#toSet(ifEquals);
                if(ifNoneOf) check.ifNoneOf = this.#toSet(ifNoneOf);
                if(ifKeyIn) check.ifKeyIn = this.#toSet(ifKeyIn);
                checks[name] = check;
            }

        }
        if(compacts !== undefined){
            for(const key in compacts){
                const parsedCompact = reInvoke.exec(key);
                if(parsedCompact !== null){
                    const grps = parsedCompact.groups as any;
                    const {destKey, srcKey} = grps;
                    const check: SetLogicOps = {
                        ifKeyIn: new Set([srcKey]),
                    };
                    newBusses[destKey] = new Set();
                    checks[destKey] = check;
                } 
                //console.log({tbd: parsedCompact});
            }
            //const invokingCompacts = Object.keys(compacts).filter(x => x.indexOf())
        }
    }

    async init(){
        //do optional stuff to improve the developer experience,
        // that involves importing references dynamically, like parsing arrow functions
        // create propagator, etc
        const checks = this.#checks;
        const busses = this.#busses;
        const {infractions, options} = this;
        const {vm, compacts, hitch} = options;
        if(infractions !== undefined){
            const {getDestructArgs} = await import('../lib/getDestructArgs.js');
            const infractionsLookup = this.#infractionsLookup;
            for(const infraction of infractions){
                let name = infraction.name;
                while(name in vm  || name in infractionsLookup){
                    name+= '_';
                }
                infractionsLookup[name] = infraction;
                const args = getDestructArgs(infraction);
                busses[name] = new Set();
                checks[name] = {
                    ifKeyIn: new Set(args),
                }
            }
        }
        if(compacts !== undefined){
            const {hydrateCompacts} = await import('./hydrateCompacts.js');
            await hydrateCompacts(compacts, this);
        }
        if(hitch !== undefined){
            const {hydrateHitches} = await import('./hydrateHitches.js');
            await hydrateHitches(hitch, this);
        }

    }


    async hydrate(keysToPropagate: Set<string>){
        //const clone = structuredClone(keysToPropagate);// new Set(keysToPropagate);
        const {options} = this;
        const {vm} = options;
        const {sleep} = vm;
        if(sleep) await vm.awake();
        // if(compacts !== undefined){
        //     const {Compact} = await import('./Compact.void');
        //     this.#compact = new Compact(compacts, vm);
        //     this.#compact.covertAssignment(vm, vm, keysToPropagate, this.#busses);
        // }
        const checks = this.#checks;
        for(const key in checks){
            const check = checks[key]!;
            const {delay} = check;
            if(delay) throw 'NI';
            const checkVal = await this.#doChecks(check!, true);
            check!.a = checkVal;
            if(checkVal){
                await this.doKey(key, vm, keysToPropagate);
            }
        }
        const routers = this.#routers;
        for(const routerKey in routers){
            // 
            this.#wireUpRouter(routerKey);
        }
    }

    
    async checkQ(keysToPropagate: Set<string>){
        const {options} = this;
        const {vm} = options;
        const {sleep} = vm;
        if(sleep) await vm.awake();
        const busses = this.#busses;
        const checks = this.#checks;
        
        let didNothing = true;
        for(const busKey in busses){
            const bus = busses[busKey];
            const check = checks[busKey];
            if(check !== undefined){
                const {debug, delay} = check;
                if(debug) debugger;
                if(delay) throw 'NI';
                const isOfInterest = await this.#checkSubscriptions(check!, bus);
                if(!isOfInterest) {
                    busses[busKey] = new Set<string>();
                    continue;
                }
                const passesChecks = await this.#doChecks(check!, false);
                check.a = passesChecks;
                if(!passesChecks) {
                    busses[busKey] = new Set<string>();
                    continue;
                }
                didNothing = false;
                busses[busKey] = new Set<string>();
                await this.doKey(busKey, vm, keysToPropagate);
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
        propagator.addEventListener('disconnectedCallback', e => {
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
            let evtTarget = vm[routerKey];
            if(evtTarget instanceof WeakRef){
                evtTarget = evtTarget.deref();
            }
            if(evtTarget instanceof EventTarget){
                ac = new AbortController();
                handlerControllers[full] = ac;
                evtTarget.addEventListener(on, async e => {
                    const keysToPropagate = new Set<string>();
                    await this.doKey(d, vm, keysToPropagate, e);
                    await this.checkQ(keysToPropagate);
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
        // if(this.#compact){
        //     const {options} = this;
        //     const {vm} = options;
        //     const compactKeysToPropagate = new Set<string>();
        //     this.#compact.covertAssignment({[key]: (<any>vm)[key]}, vm, compactKeysToPropagate, this.#busses);
        // }
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
        const routes = this.#routers[key];
        if(routes !== undefined){
            throw 'NI';
        }
    }

    async #checkSubscriptions(check: SetLogicOps, bus: Set<string>): Promise<boolean>{
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
        const {ifAllOf, ifKeyIn, ifAtLeastOneOf, ifEquals, ifNoneOf, debug} = check;
        if(debug) debugger;
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
                    isFirst = false;
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

    async doKey(key: string, vm: any, keysToPropagate: Set<string>, e?: Event){
        //if(key.startsWith('dispatch')) debugger;
        const method = vm[key] || this.#infractionsLookup[key];
        const isAsync = method.constructor.name === 'AsyncFunction';
        const ret = isAsync ? await method.apply(vm, [vm, e, this]) : method.apply(vm, [vm, e, this]);
        
        const busses = this.#busses;
        busses[key] = new Set();
        if(ret === undefined || ret === null) return;
        const keys = Object.keys(ret).filter(key => ret[key] !== vm[key]);
        // if(this.#compact){
        //     this.#compact.covertAssignment(ret, vm as RoundaboutReady, keysToPropagate, this.#busses);
        // }
        vm.covertAssignment(ret);
        
        
        keys.forEach(returnKey => {
            keysToPropagate.add(returnKey);
            for(const busKey in busses){
                const bus = busses[busKey];
                bus.add(returnKey);
            }
        });
        

    }
}

export const whenSrcKeyChanges = String.raw `^when_(?<srcKey>[\w]+)_changes_`;
const reInvoke = new RegExp(String.raw `${whenSrcKeyChanges}invoke_(?<destKey>[\w]+)`);

export class RoundAboutEvent extends Event{}

// export class ActionBus{
//     bus = new Set<string>();
// }