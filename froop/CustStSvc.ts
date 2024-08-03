import { O } from "./O.js";
import { EventHandler } from '../EventHandler.js';

class Reflect extends EventHandler<CustStSvc>{
    instance: O | undefined;
    internals: ElementInternals | undefined; 
    propName: string | undefined;
    override handleEvent(): void {
        const instance = this.instance!;
        const propName = this.propName!;
        const internals = this.internals!;
        const val = (<any>instance)[propName!];
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
            const reflector = new Reflect(this);
            Object.assign(reflector, {instance, internals, propName});
            reflector.sub(propagator, propName, {signal: ac.signal});
            // propagator.addEventListener(propName, e => {
            //     this.#reflect(instance, internals, propName)
            // }, {signal: ac.signal});
            reflector.handleEvent();
            //this.#reflect(instance, internals, propName);
        }
        propagator.addEventListener('disconnectedCallback', e => {
            this.#disconnect();
        });
        const complexOnes = splitSplit.filter(x => x.length > 1);
        if(complexOnes.length > 0){
            const {CustStExt} = await import('./CustStExt.js');
            new CustStExt(instance, internals, this.customStatesToReflect, complexOnes);
        }
    }



    // #reflect(instance: O, internals: ElementInternals, propName: string){
    //     const val = (<any>instance)[propName!];
    //     const method = val ? 'add' : 'delete';
    //     (<any>internals).states[method](propName);
        
    // }



    #disconnect(){
        for(const ac of this.#acs){
            ac.abort();
        }
    }
}