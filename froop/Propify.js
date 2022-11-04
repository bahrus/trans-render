import { pc, npb, ccb, dcb, mse } from './const.js';
import { ReslvSvc } from "./ReslvSvc.js";
export class Propify extends ReslvSvc {
    args;
    constructor(args) {
        super();
        this.args = args;
        args.main.addEventListener(mse, () => {
            this.#do(args);
        }, { once: true });
    }
    async #do(args) {
        const { services } = args;
        const { define: createCustomEl, propRegistry: createPropInfos } = services;
        await createCustomEl.resolve();
        createCustomEl.addEventListener(ccb, e => {
            //console.log('connectedCallback');
            const connection = e.detail;
            const { instance } = connection;
            const propBag = this.#getStore(instance);
        });
        createCustomEl.addEventListener(dcb, e => {
            const disconnection = e.detail;
            this.stores.delete(disconnection.instance);
        });
        await createPropInfos.resolve();
        if (Object.keys(createPropInfos.propInfos).length > 0) {
        }
        this.#addProps(createCustomEl.custElClass, createPropInfos.propInfos);
        this.resolved = true;
    }
    stores = new WeakMap;
    #getStore(instance) {
        let propBag = this.stores.get(instance);
        if (propBag === undefined) {
            propBag = new Propagate();
            this.stores.set(instance, propBag);
            this.dispatchEvent(new CustomEvent(npb, {
                detail: {
                    instance,
                    propBag
                }
            }));
        }
        return propBag;
    }
    #addProps(newClass, props) {
        const proto = newClass.prototype;
        const getPropBag = this.#getStore.bind(this);
        for (const key in props) {
            if (key in proto)
                continue;
            Object.defineProperty(proto, key, {
                get() {
                    return getPropBag(this).get(key);
                },
                set(nv) {
                    //console.log('set', {key, nv});
                    getPropBag(this).set(key, nv);
                },
                enumerable: true,
                configurable: true,
            });
        }
    }
}
export class Propagate extends EventTarget {
    #propVals = {};
    get(key) {
        return this.#propVals[key];
    }
    set(key, newVal) {
        const oldVal = this.#propVals[key];
        this.#propVals[key] = newVal;
        const init = {
            detail: {
                key, oldVal, newVal
            }
        };
        this.dispatchEvent(new CustomEvent(key, init));
        this.dispatchEvent(new CustomEvent(pc, init));
    }
    /**
     * delta keys
     */
    dk = new Set();
}
