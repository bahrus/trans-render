import { pc, xsr, ccb, mse } from './const.js';
import { Svc } from "./Svc.js";
export class PropSvc extends Svc {
    args;
    constructor(args) {
        super();
        this.args = args;
        args.definer.addEventListener(mse, () => {
            this.#do(args);
        }, { once: true });
    }
    createPropBag(instance) {
        const propBag = this.#getStore(instance, true); //causes propagator to be created
        propBag['#resolved'] = true;
    }
    async #do(args) {
        const { services } = args;
        const { definer: createCustomEl, itemizer: createPropInfos } = services;
        await createCustomEl.resolve();
        createCustomEl.addEventListener(ccb, e => {
            const connection = e.detail;
            const { instance } = connection;
            const propBag = this.#getStore(instance, true); //causes propagator to be created
            propBag['#resolved'] = true;
            //ideally this is where we call propup
        });
        // createCustomEl.addEventListener(dcb, e => {
        //     const disconnection = (e as CustomEvent).detail as IDisconnectedCB;
        //     this.stores.delete(disconnection.instance);
        // });
        await createPropInfos.resolve();
        this.#addProps(createCustomEl.custElClass, createPropInfos.propInfos);
        this.resolved = true;
    }
    #getStore(instance, forceNew) {
        let propagator = instance.xtalState;
        //let propagator = this.stores.get(instance);
        if (propagator === undefined && forceNew) {
            propagator = new Propagator();
            instance.xtalState = propagator;
            this.dispatchEvent(new CustomEvent(xsr, {
                detail: {
                    instance,
                    propagator
                }
            }));
        }
        return propagator;
    }
    #syncUp(instance, propagator) {
        const unhydrated = this.#unhydratedStores.get(instance);
        if (unhydrated !== undefined) {
            for (const key of unhydrated.keys()) {
                const val = unhydrated.get(key);
                propagator.set(key, val);
            }
            this.#unhydratedStores.delete(instance);
        }
    }
    #unhydratedStores = new WeakMap();
    #addProps(newClass, props) {
        const proto = newClass.prototype;
        const getPropBag = this.#getStore.bind(this);
        const unhydrated = this.#unhydratedStores;
        const syncUp = this.#syncUp.bind(this);
        for (const key in props) {
            if (key in proto)
                continue;
            Object.defineProperty(proto, key, {
                get() {
                    const propagator = getPropBag(this, false);
                    if (propagator !== undefined) {
                        if (unhydrated.has(this)) {
                            syncUp(this, propagator);
                        }
                        return propagator.get(key);
                    }
                    else {
                        return unhydrated.get(this)?.get(key);
                    }
                },
                set(nv) {
                    const propagator = getPropBag(this, false);
                    if (propagator !== undefined) {
                        propagator.set(key, nv);
                    }
                    else {
                        if (!unhydrated.has(this)) {
                            unhydrated.set(this, new Map());
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
export class Propagator extends EventTarget {
    #propVals = {};
    get(key) {
        return this.#propVals[key];
    }
    set(key, newVal) {
        //console.log({key, newVal});
        const oldVal = this.#propVals[key];
        this.#propVals[key] = newVal;
        const init = {
            detail: {
                key, prop: key, oldVal, newVal
            }
        };
        this.dispatchEvent(new CustomEvent(key, init));
        this.dispatchEvent(new CustomEvent(pc, init));
    }
    /**
     * delta keys
     */
    dk = new Set();
    /**
     * mature keys
     */
    mk = new Set();
}
