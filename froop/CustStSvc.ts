import { O } from "./O.js";

class Reflect implements EventListenerObject{
    constructor(
        public instance: O,
        public internals: ElementInternals,
        public propName: string,
    ){}
    handleEvent(): void {
        const {instance, internals, propName} = this;
        const val = (<any>instance)[propName];
        const method = val ? 'add' : 'delete';
        (<any>internals).states[method](propName);
    }
}

export class CustStSvc{
    #acs: AbortController[] = [];
    constructor(instance: O, internals: ElementInternals, public customStatesToReflect: string){
        this.#do(instance, internals);
    }
    
    async #do(instance: O, internals: ElementInternals){
        const splitSplit = this
            .customStatesToReflect
            .split(',')
            .map(s => s.trim().split(' if ').map(t => t.trim()));
        const simpleOnes = splitSplit.filter(x => x.length === 1);
        const {propagator} = instance;
        //Use flatten?
        for(const propName of simpleOnes.map(x => x[0])){
            const ac: AbortController = new AbortController();
            this.#acs.push(ac);
            const reflector = new Reflect(instance, internals, propName);
            propagator.addEventListener(propName, reflector, {signal: ac.signal});
        }
        propagator.addEventListener('disconnectedCallback', e => {
            this.#disconnect();
        }, {once: true});
        const complexOnes = splitSplit.filter(x => x.length > 1);
        if(complexOnes.length > 0){
            const {CustStExt} = await import('./CustStExt.js');
            new CustStExt(instance, internals, this.customStatesToReflect, complexOnes);
        }
    }


    #disconnect(){
        for(const ac of this.#acs){
            ac.abort();
        }
    }
}