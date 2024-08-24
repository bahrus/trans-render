import { Propagator } from '../../lib/bePropagating';
import { AbsOptions, AbsorbingObject, SharingObject } from '../../ts-refs/trans-render/asmr/types';
import { ASMR } from '../asmr.js';

export class Std<TProp=any> extends EventTarget implements 
    AbsorbingObject, EventListenerObject {
    #so: SharingObject | undefined;
    #propagator: Propagator | undefined;

    constructor(
        sourceEl: Element, 
        public ao: AbsOptions, 
        //public so: SharingObject,
        public disconnectedSignal?: AbortSignal,
    ){
        super();
    }
    handleEvent(e: Event){
        this.dispatchEvent(new Event('value'));
    }
    async getValue(el: Element) {
        const {isRA, } = this.ao;
        if(isRA){

        }
        if(this.#so !== undefined){
            return this.#so.pureValue;
        }
        
    }

    

    async readMind(sourceEl: Element){
        const {localName} = sourceEl;
        const ao = this.ao;
        if(localName.includes('-')){
            await customElements.whenDefined(localName);
            const propagator = (<any>sourceEl).propagator;
            if(propagator instanceof EventTarget){
                ao.isRA = true;
                let {propToAbsorb, propToAbsorbValueType} = ao;
                if(propToAbsorb === undefined) {
                    propToAbsorb = ASMR.getValueProp(sourceEl, propToAbsorbValueType);
                }
            }else{
                throw 'NI';
            }
        }
        //this.dispatchEvent(new Event('readMind'));
    }
    #ac: AbortController | undefined;
    async hydrate(sourceEl: Element, ao: AbsOptions){
        
        const {propToAbsorbValueType} = ao;
        if(propToAbsorbValueType !== undefined){
            const propagator = this.#propagator;
            if(propagator !== undefined){
                const ac = new AbortController();
                propagator.addEventListener(propToAbsorbValueType, this, {signal: ac.signal});
                this.#ac = ac;
            }else{
                throw 'NI';
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