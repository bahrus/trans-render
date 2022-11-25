import { PropInfo, DefineArgs } from "../lib/types";
import { pc, npb, ccb, dcb, r, mse} from './const.js';
import { Svc } from "./Svc.js";
import { IPropagator, IPropSvc, CEArgs, INewPropagator, IConnectedCB, IDisconnectedCB, IPropChg } from './types';

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
            console.debug('connectedCallback');
            const connection = (e as CustomEvent).detail as IConnectedCB;
            const {instance} = connection;
            const propBag = this.#getStore(instance, true); //causes propagator to be created
        });
        createCustomEl.addEventListener(dcb, e => {
            const disconnection = (e as CustomEvent).detail as IDisconnectedCB;
            this.stores.delete(disconnection.instance);
        });
        await createPropInfos.resolve();
        this.#addProps(createCustomEl.custElClass, createPropInfos.propInfos);  
        this.resolved = true;      
    }

    stores = new WeakMap<HTMLElement, Propagator>();

    #getStore(instance: HTMLElement, forceNew: boolean){
        let propagator = this.stores.get(instance);
        if(propagator === undefined && forceNew){
            propagator = new Propagator();
            this.stores.set(instance, propagator);
            this.dispatchEvent(new CustomEvent(npb, {
                detail: {
                    instance,
                    propagator
                } as INewPropagator
            }));

        }
        return propagator;
    }

    #syncUp(instance: HTMLElement, propagator: Propagator){
        const unhydrated = this.#unhydratedStores.get(instance);
        if(unhydrated !== undefined){
            for(const key of unhydrated.keys()){
                const val = unhydrated.get(key);
                propagator.set(key, val);
            }
            this.#unhydratedStores.delete(instance);
        }
    }

    #unhydratedStores = new WeakMap<HTMLElement, Map<string, any>>();

    #addProps(newClass: {new(): HTMLElement}, props: {[key: string]: PropInfo}){
        const proto = newClass.prototype;
        const getPropBag = this.#getStore.bind(this);
        const unhydrated = this.#unhydratedStores;
        const syncUp = this.#syncUp.bind(this);
        for(const key in props){
            if(key in proto) continue;
            Object.defineProperty(proto, key, {
                get(){
                    const propagator = getPropBag(this, false);
                    if(propagator !== undefined){
                        if(unhydrated.has(this)){
                            syncUp(this, propagator);
                        }
                        return propagator.get(key);
                    }else{
                        return unhydrated.get(this)?.get(key);
                    }
                    
                },
                set(nv: any){
                    const propagator = getPropBag(this, false);
                    if(propagator !== undefined){
                        propagator.set(key, nv);
                    }else{
                        if(!unhydrated.has(this)){
                            unhydrated.set(this, new Map<string, any>());
                        }
                        unhydrated.get(this)?.set(key, nv);
                    }
                },
                enumerable: true,
                configurable: true,
            });
        }
    }
}


export class Propagator extends EventTarget{
    #propVals: {[key: string]: any} = {};
    get(key: string){
        return this.#propVals[key];
    }
    set(key: string, newVal: any){
        //console.log({key, newVal});
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
    
    /**
     * mature keys
     */
    mk = new Set<string>();

}

export interface Propagator extends IPropagator{}
