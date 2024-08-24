import { Propagator } from '../../lib/bePropagating';
import { AbsOptions, AbsorbingObject, SharingObject } from '../../ts-refs/trans-render/asmr/types';
import { ASMR } from '../asmr.js';

export class Std<TProp=any> extends EventTarget implements 
    AbsorbingObject, EventListenerObject {
    //#readMind = false;
    #so: SharingObject | undefined;
    #propagator: Propagator | undefined;

    constructor(
        sourceEl: Element, 
        public ao: AbsOptions, 
        //public so: SharingObject,
        public disconnectedSignal?: AbortSignal,
    ){
        super();
        this.readMind(sourceEl, ao);
    }
    handleEvent(e: Event){
        this.dispatchEvent(new Event('value'));
    }
    async getValue(el: Element) {
        if(this.#so !== undefined){
            return this.#so.pureValue;
        }
        
    }

    

    async readMind(sourceEl: Element, ao: AbsOptions){
        const {localName} = sourceEl;
        if(localName.includes('-')){
            await customElements.whenDefined(localName);
            const propagator = (<any>sourceEl).propagator;
            if(propagator instanceof EventTarget){
                ao.isRA = true;
                let {propToAbsorb, valueType} = ao;
                if(propToAbsorb === undefined) {
                    propToAbsorb = ASMR.getValueProp(sourceEl, valueType);
                }
            }else{
                throw 'NI';
            }
        }
        //this.#readMind = true;
        //this.dispatchEvent(new Event('readMind'));
    }
    #ac: AbortController | undefined;
    async hydrate(sourceEl: Element, ao: AbsOptions){
        
        const {valueProp} = ao;
        if(valueProp !== undefined){
            const propagator = this.#propagator;
            if(propagator !== undefined){
                const ac = new AbortController();
                propagator.addEventListener(valueProp, this, {signal: ac.signal});
                this.#ac = ac;
            }
        }else{
            throw 'NI';
        }

    }

    async deHydrate(){
        this.disconnectedSignal?.addEventListener('abort', e => {
            this.#ac?.abort();
        });
    }
    
}