import { PropInfo, DefineArgs } from "../lib/types";
import { pc, npb, ccb, dcb, r, mse} from './const.js';
import { Svc } from "./Svc.js";
import { IPropBag as IPropagate, IPropSvc, CEArgs, INewPropBag, IConnectedCB, IDisconnectedCB, IPropChg } from './types';

export class PropSvc extends Svc implements IPropSvc{
    constructor(public args: CEArgs){
        super();
        args.definer!.addEventListener(mse, () => {
            this.#do(args);
        }, {once: true});
        
    }

    async #do(args: CEArgs){
        const {services} = args;
        const {definer: createCustomEl, itemizer: createPropInfos} = services!;
        await createCustomEl.resolve();
        createCustomEl.addEventListener(ccb, e => {
            //console.log('connectedCallback');
            const connection = (e as CustomEvent).detail as IConnectedCB;
            const {instance} = connection;
            const propBag = this.#getStore(instance);
        });
        createCustomEl.addEventListener(dcb, e => {
            const disconnection = (e as CustomEvent).detail as IDisconnectedCB;
            this.stores.delete(disconnection.instance);
        });
        await createPropInfos.resolve();
        if(Object.keys(createPropInfos.propInfos).length > 0){

        }
        this.#addProps(createCustomEl.custElClass, createPropInfos.propInfos);  
        this.resolved = true;      
    }

    stores = new WeakMap<HTMLElement, Propagate>

    #getStore(instance: HTMLElement){
        let propBag = this.stores.get(instance);
        if(propBag === undefined){
            propBag = new Propagate();
            this.stores.set(instance, propBag);
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
        const getPropBag = this.#getStore.bind(this);
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


export class Propagate extends EventTarget{
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

export interface Propagate extends IPropagate{}
