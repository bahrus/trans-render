import { pc, npb, ccb, dcb, mse } from './const.js';
import { ResolvableService } from "./ResolvableService.js";
export class AddProps extends ResolvableService {
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
        const { createCustomEl, createPropInfos } = services;
        await createCustomEl.resolve();
        createCustomEl.addEventListener(ccb, e => {
            //console.log('connectedCallback');
            const connection = e.detail;
            const { instance } = connection;
            const propBag = this.#getPropBag(instance);
            // this.dispatchEvent(new CustomEvent(npb, {
            //     detail: {
            //         instance,
            //         propBag
            //     } as INewPropBag,
            // }))
        });
        createCustomEl.addEventListener(dcb, e => {
            const disconnection = e.detail;
            this.#propBagLookup.delete(disconnection.instance);
        });
        await createPropInfos.resolve();
        this.#addProps(createCustomEl.custElClass, createPropInfos.propInfos);
        this.resolved = true;
    }
    #propBagLookup = new WeakMap;
    #getPropBag(instance) {
        let propBag = this.#propBagLookup.get(instance);
        if (propBag === undefined) {
            propBag = new PropBag();
            this.#propBagLookup.set(instance, propBag);
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
        const getPropBag = this.#getPropBag.bind(this);
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
export class PropBag extends EventTarget {
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
