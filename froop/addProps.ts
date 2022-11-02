import { PropInfo, DefineArgs } from "../lib/types";
import { pc, npb, ccb, dcb} from './const.js';
import { ResolvableService } from "./ResolvableService.js";
import { IPropBag, IAddProps, DefineArgsWithServices, INewPropBag, IConnectedCB, IDisconnectedCB } from './types';

export class AddProps extends ResolvableService implements IAddProps{
    constructor(public args: DefineArgsWithServices){
        super();
        this.#do(args);
    }

    async #do(args: DefineArgsWithServices){
        const {services} = args;
        const {createCustomEl, createPropInfos} = services!;
        await createCustomEl.resolve();
        createCustomEl.addEventListener(ccb, e => {
            const connection = (e as CustomEvent).detail as IConnectedCB;
            const {instance} = connection;
            const propBag = this.#getPropBag(instance);
            this.dispatchEvent(new CustomEvent(npb, {
                detail: {
                    instance,
                    propBag
                } as INewPropBag,
            }))
        });
        createCustomEl.addEventListener(dcb, e => {
            const disconnection = (e as CustomEvent).detail as IDisconnectedCB;
            this.#propBagLookup.delete(disconnection.instance);
        });
        await createPropInfos.resolve();
        this.#addProps(createCustomEl.custElClass, createPropInfos.propInfos);        
    }

    #propBagLookup = new WeakMap<HTMLElement, PropBag>

    #getPropBag(instance: HTMLElement){
        let propBag = this.#propBagLookup.get(instance);
        if(propBag === undefined){
            propBag = new PropBag();
            this.#propBagLookup.set(instance, propBag);
            this.dispatchEvent(new CustomEvent(npb, {
                detail: {
                    instance,
                    propBag
                } as INewPropBag
                
            }));
        }
        return propBag;
    }

    #addProps(newClass: {new(): HTMLElement}, props: {[key: string]: PropInfo}){
        const proto = newClass.prototype;
        const getPropBag = this.#getPropBag.bind(this);
        for(const key in props){
            if(key in proto) continue;
            Object.defineProperty(proto, key, {
                get(){
                    return getPropBag(this).get(key);
                },
                set(nv: any){
                    getPropBag(this).set(key, nv);
                },
                enumerable: true,
                configurable: true,
            });
        }
    }
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
