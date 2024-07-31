import { O } from "./O.js";
import {PropLookup, RoundaboutReady} from '../ts-refs/trans-render/froop/types.js';

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
            propagator.addEventListener(propName, e => {
                this.#reflect(instance, internals, propName)
            }, {signal: ac.signal});
            this.#reflect(instance, internals, propName);
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

    #reflect(instance: O, internals: ElementInternals, propName: string){
        const val = (<any>instance)[propName!];
        const method = val ? 'add' : 'delete';
        (<any>internals).states[method](propName);
        
    }



    #disconnect(){
        for(const ac of this.#acs){
            ac.abort();
        }
    }
}