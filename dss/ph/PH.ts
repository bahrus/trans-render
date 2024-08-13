import { PHI } from "../../ts-refs/trans-render/dss/types";


/**
 * Prop Host
 */
export class PH<TValue = any> implements PHI<TValue>{
    #propagator: EventTarget = new EventTarget();
    get propagator(){
        return this.#propagator;
    }
    #value: TValue | undefined;
    async getValue(el: Element){
        return this.#value;
    }
    syncVal(el: Element){

    }
    async setValue(el: Element, nv: TValue){
        this.#value = nv;
        const {localName} = el;
        const setMethod = `set_${localName}`;
        if(setMethod in this){
            const method = (<any>this)[setMethod];
            if(method instanceof Function){
                await method(el, nv);
            }else{
                el.textContent = this.toString(nv);
            }
        }else{
            el.textContent = this.toString(nv);
        }
        this.propagator.dispatchEvent(new Event('value'));
    }

    async hydrate(el: Element){
        const {localName} = el;
        const hydrateMethod = `hydrate_${localName}`;

    }
    #ac: AbortController | undefined;
    handleEvent(e: Event){
        
    }

    disconnect(){
        if(this.#ac !== undefined) this.#ac.abort();
    }

    toString(nv: TValue){
        return nv===null || nv === undefined ? '' : nv.toString();
    }

    async set_input(el: HTMLInputElement, nv: TValue){
        const {type} = el;
        switch(type){
            case 'input':
                el.value = this.toString(nv);
                break;
        }
    }
}





