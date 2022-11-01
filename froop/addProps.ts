import { PropInfo, DefineArgs } from "../lib/types";
import {pbk, pc, trpb, cpi} from './const.js';
import { ResolvableService } from "./ResolvableService.js";
import { IPropBag, IAddProps, DefineArgsWithServices } from './types';

export class AddProps extends ResolvableService implements IAddProps{
    constructor(public args: DefineArgsWithServices){
        super();
        this.do();
    }

    async do(){

    }
}

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



export class PropBag extends EventTarget implements IPropBag{
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
