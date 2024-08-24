import { AbsOptions, AbsorbingObject, SharingObject } from '../../ts-refs/trans-render/asmr/types';

export class Std<TProp=any> extends EventTarget implements 
    AbsorbingObject, EventListenerObject {
    //#readMind = false;
    constructor(
        sourceEl: Element, 
        public ao: AbsOptions, 
        public so: SharingObject,
        public disconnectedSignal?: AbortSignal,
    ){
        super();
        this.readMind(sourceEl, ao);
    }
    handleEvent(e: Event){
        this.dispatchEvent(new Event('value'));
    }
    async getValue(el: Element) {
        return this.so.pureValue;
    }

    

    async readMind(sourceEl: Element, ao: AbsOptions){

        //this.#readMind = true;
        //this.dispatchEvent(new Event('readMind'));
    }
    #ac: AbortController | undefined;
    async hydrate(sourceEl: Element, ao: AbsOptions){
        const {localName} = sourceEl;
        const {valueProp} = ao;
        if(valueProp !== undefined){
            if(localName.includes('-')){
                await customElements.whenDefined(localName);
                const propagator = (<any>sourceEl).propagator;
                if(propagator instanceof EventTarget){
                    const ac = new AbortController();
                    propagator.addEventListener(valueProp, this, {signal: ac.signal});
                    this.#ac = ac;
                }else{
                    throw 'NI';
                }
            }
        }

    }

    async deHydrate(){
        this.disconnectedSignal?.addEventListener('abort', e => {
            this.#ac?.abort();
        });
    }
    
}