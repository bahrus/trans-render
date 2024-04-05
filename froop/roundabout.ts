import {roundaboutOptions, RoundaboutReady, Busses} from './types';

export async function roundabout<TProps = any, TActions = TProps>(
    vm: TProps & TActions & RoundaboutReady, options: roundaboutOptions<TProps, TActions>){
    const ra = new RoundAbout(vm, options);
    await ra.init();
}

export class RoundAbout{
    #busses: Busses;
    constructor(public vm: RoundaboutReady, public options: roundaboutOptions){
        const newBusses : Busses = {}
        this.#busses = newBusses;
        const {actions} = options;
        for(const key in actions){
            newBusses[key] = new Set();
            
        }
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
    }
}

export class ActionBus{
    bus = new Set<string>();
}