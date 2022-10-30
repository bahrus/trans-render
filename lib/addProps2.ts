import { PropInfo } from "./types";

export function addProps(newClass: {new(): EventTarget}, props: {[key: string]: PropInfo}){
    const proto = newClass.prototype;
    for(const key in props){
        if(key in proto) continue;
        Object.defineProperty(proto, key, {
            get(){
                return propBag(this).get(key);
            },
            set(nv: any){

            },
            enumerable: true,
            configurable: true,
        })
    }
}

export const trpb = 'trans-render-prop-bag';

function propBag(instance: EventTarget){
    let returnObj = (<any>instance)[pbk] as PropBag;
    if(returnObj === undefined){
        returnObj = new PropBag();
        (<any>instance)[pbk] = returnObj;
        instance.dispatchEvent(new CustomEvent(trpb, {
            detail:{
                value: returnObj
            }
        }));
    }
    return returnObj;
}

/**
 * abrev for prop-change
 */
export const pc = 'prop-change';

export class PropBag extends EventTarget{
    #propVals: {[key: string]: any} = {};
    get(key: string){
        return this.#propVals[key];
    }
    set(key: string, newVal: any){
        const oldVal = this.#propVals[key];
        this.#propVals[key] = newVal;
        const init: CustomEventInit = {
            detail:{
                key, oldVal, newVal
            }
        }
        this.dispatchEvent(new CustomEvent(key, init));
        this.dispatchEvent(new CustomEvent(pc, init));
    }
    /**
     * delta keys
     */
    dk = new Set<string>(); 
}

/**
 * PropBagKey
 */
export const pbk = Symbol();