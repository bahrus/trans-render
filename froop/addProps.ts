import { PropInfo, DefineArgs } from "../lib/types";
import { pc, npb, ccb, dcb, r, mse} from './const.js';
import { ReslvSvc } from "./ReslvSvc.js";
import { IPropBag, IAddProps, DefineArgsWithServices, INewPropBag, IConnectedCB, IDisconnectedCB, IPropChg } from './types';

export class AddProps extends ReslvSvc implements IAddProps{
    constructor(public args: DefineArgsWithServices){
        super();
        args.main!.addEventListener(mse, () => {
            this.#do(args);
        }, {once: true});
        
    }

    async #do(args: DefineArgsWithServices){
        const {services} = args;
        const {createCustomEl, createPropInfos} = services!;
        await createCustomEl.resolve();
        createCustomEl.addEventListener(ccb, e => {
            //console.log('connectedCallback');
            const connection = (e as CustomEvent).detail as IConnectedCB;
            const {instance} = connection;
            const propBag = this.#getPropBag(instance);
        });
        createCustomEl.addEventListener(dcb, e => {
            const disconnection = (e as CustomEvent).detail as IDisconnectedCB;
            this.#propBagLookup.delete(disconnection.instance);
        });
        await createPropInfos.resolve();
        this.#addProps(createCustomEl.custElClass, createPropInfos.propInfos);  
        this.resolved = true;      
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
                    //console.log('set', {key, nv});
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
            } as IPropChg
        }
        this.dispatchEvent(new CustomEvent(key, init));
        this.dispatchEvent(new CustomEvent(pc, init));
    }
    /**
     * delta keys
     */
    dk = new Set<string>(); 
}
