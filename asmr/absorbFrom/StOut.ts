import { AbsOptions, AbsorbingObject, BuiltInEditables, SharingObject } from '../../ts-refs/trans-render/asmr/types.js';
import { ASMR } from '../asmr.js';

export class StOut<TProp=any> extends EventTarget implements 
    AbsorbingObject, EventListenerObject {
    #so: SharingObject | undefined;
    #propagator: EventTarget | undefined;

    constructor(
        sourceEl: Element, 
        public ao: AbsOptions, 
        public disconnectedSignal?: AbortSignal,
    ){
        super();
    }
    handleEvent(e: Event){
        this.dispatchEvent(new Event('value'));
    }
    async getValue(el: Element) {
        const {isRAR, propToAbsorb} = this.ao;
        if(isRAR){
            return (<any>el)[propToAbsorb!];
        }
        if(this.#so !== undefined){
            return this.#so.pureValue;
        }
        
    }

    

    async readMind(sourceEl: Element){
        const {localName} = sourceEl;
        const ao = this.ao;
        const isBuiltInEditable = builtInEditables.includes(localName);
        if(isBuiltInEditable || sourceEl.hasAttribute('contentEditable')){
            const {UEMR} = await import('./UEMR.js');
            UEMR(sourceEl, ao);

        }else if(localName.includes('-')){
            await customElements.whenDefined(localName);
            const propagator = (<any>sourceEl).propagator;
            if(propagator instanceof EventTarget){
                this.#propagator = propagator;
                ao.isRAR = true;
                let {propToAbsorb, propToAbsorbValueType} = ao;
                if(propToAbsorb === undefined) {
                    ao.propToAbsorb = ASMR.getValueProp(sourceEl, propToAbsorbValueType);
                }
            }else{
                const {beRR, props} = await import('../../froop/beRR.js');
                const ret = beRR(sourceEl);
                if(ret){
                    ao.isRAE = true;
                    let {propToAbsorb, propToAbsorbValueType} = ao;
                    this.#propagator = (<any>sourceEl)[props[0]];
                    if(propToAbsorb === undefined) {
                        ao.propToAbsorb = ASMR.getValueProp(sourceEl, propToAbsorbValueType);
                    }
                    (<any>sourceEl)[props[2]](ao.propToAbsorb);
                }else{
                    throw 'NI';
                }
            }
        }
        //this.dispatchEvent(new Event('readMind'));
    }
    #ac: AbortController | undefined;
    async hydrate(sourceEl: Element){
        const {ao} = this;
        const {propToAbsorb, isUE, UEEN} = ao;
        if(isUE && UEEN !== undefined){
            const ac = new AbortController();
            sourceEl.addEventListener(UEEN, this, {signal: ac.signal});
            this.#ac = ac;
            return;
        }
        if(propToAbsorb !== undefined){
            const propagator = this.#propagator;
            if(propagator !== undefined){
                const ac = new AbortController();
                propagator.addEventListener(propToAbsorb, this, {signal: ac.signal});
                this.#ac = ac;
                return;
            }else{
                throw 'NI';
            }
        }
        throw 'NI';


    }

    async deHydrate(){
        this.disconnectedSignal?.addEventListener('abort', e => {
            this.#ac?.abort();
        });
    }
    
}

const builtInEditables: Array<BuiltInEditables> = ['input', 'select', 'textarea'];