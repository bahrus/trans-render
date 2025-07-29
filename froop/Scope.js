import { RRMixin } from './RRMixin.js';
import { assignGingerly } from '../lib/assignGingerly.js';
const publicPrivateStore = Symbol();
export class Scope extends RRMixin(EventTarget) {
    propagator = new EventTarget();
    [publicPrivateStore] = {};
    async covertAssignment(obj) {
        const props = this.constructor.props;
        const extObj = {};
        for (const key in obj) {
            const prop = props[key];
            const val = obj[key];
            if (prop === undefined)
                throw 403;
            extObj[key] = val;
        }
        await assignGingerly(this[publicPrivateStore], extObj);
    }
    async 'arr=>'(self, arr) {
        const { ishListCountProp, defaultIshList } = this.#config;
        const returnArr = arr || defaultIshList;
        if (ishListCountProp !== undefined) {
            this[ishListCountProp] = returnArr === undefined ? 0 : returnArr.length;
            ;
        }
        return returnArr;
    }
    /**
     * This gets called when an element is adorned by the itemscope=my-element
     * @param el
     */
    async '<mount>'(self, el) {
        const config = this.#config;
        const { propDefaults, propInfo, xform, mapParentScopeRefTo, ignoreItemProp } = config;
        if (propInfo !== undefined) {
            this.#propUp(propInfo);
        }
        await this.#instantiateRoundaboutIfApplicable();
        if (xform === undefined)
            return;
        const { Transform } = await import('../Transform.js');
        const transform = await Transform(el, this, xform, {
            propagator: this.propagator,
            propagatorIsReady: true,
        });
        //[TODO] make this private so can troubleshoot better
        //this.transform = transform;
        this.dispatchEvent(new Event('resolved'));
        const hasItemProp = el.hasAttribute('itemprop');
        if (mapParentScopeRefTo !== undefined || (hasItemProp && !ignoreItemProp)) {
            //for now, assume that the parent scope will be an ancestor of el
            const parentScope = el.parentElement?.closest('[itemscope]:not([itemscope=""])');
            if (parentScope) {
                const ish = await (await import('mount-observer/waitForIsh.js')).waitForIsh(parentScope);
                if (mapParentScopeRefTo !== undefined) {
                    self[mapParentScopeRefTo] = new WeakRef(ish);
                }
                if (hasItemProp && !ignoreItemProp) {
                    //if the parent scope has an itemprop, then we need to set it
                    //on the current scope
                    const itemProp = el.getAttribute('itemprop');
                    if (itemProp !== null) {
                        el['ish'] = ish[itemProp];
                        ish.propagator.addEventListener(itemProp, (ev) => {
                            //TODO need to be able to do cleanup here
                            el['ish'] = ish[itemProp];
                        });
                    }
                }
                if (ish instanceof RRMixin) {
                }
            }
        }
    }
    #scopeIndex = 0;
    /**
     * This get invoked if the element with the itemscope=my-element
     * attribute has an itemref attribute, and one of the elements with id matching
     * the itemref is found.
     * @param el
     */
    async '<inScope>'(self, el) {
        const inScopeXForms = this.#config.inScopeXForms;
        if (inScopeXForms === undefined)
            return;
        const { Transform } = await import('../Transform.js');
        for (const cssQuery in inScopeXForms) {
            if (!el.matches(cssQuery))
                continue;
            const xform = inScopeXForms[cssQuery];
            await Transform(el, this, xform, {
                propagator: this.propagator,
                propagatorIsReady: true,
            });
        }
    }
    async #instantiateRoundaboutIfApplicable() {
        const config = this.#config;
        const { actions, compacts, infractions, handlers, positractions, isSleepless } = config;
        if ((actions || compacts || infractions || handlers || positractions) !== undefined) {
            let mountObservers;
            if (!isSleepless) {
                const { guid } = await import('mount-observer/MountObserver.js');
                mountObservers = this[guid];
            }
            const { roundabout } = await import('./roundabout.js');
            const [vm, ra] = await roundabout({
                vm: this,
                actions,
                compacts,
                handlers,
                positractions,
                mountObservers
            }, infractions);
            this.#roundabout = ra;
        }
    }
    #propUp(props) {
        for (const key in props) {
            const propInfo = props[key];
            let value = this[key];
            if (value === undefined) {
                value = propInfo.def;
            }
            if (value !== undefined) {
                this[publicPrivateStore][key] = value;
            }
        }
    }
    /**
     * provided for debugging purposes
     * so don't remove it even though no references to it other than initialization
     */
    #roundabout;
    get #config() {
        return this.constructor.config;
    }
    static addProps(newClass, props) {
        const proto = newClass.prototype;
        for (const key in props) {
            if (key in proto)
                continue;
            const prop = props[key];
            const { ro, adjuster } = prop;
            if (ro) {
                Object.defineProperty(proto, key, {
                    get() {
                        return this[publicPrivateStore][key];
                    },
                    enumerable: true,
                    configurable: true,
                });
            }
            else {
                Object.defineProperty(proto, key, {
                    get() {
                        return this[publicPrivateStore][key];
                    },
                    set(nv) {
                        let adjustedNV = nv;
                        if (adjuster !== undefined) {
                            if (typeof adjuster === 'function') {
                                adjustedNV = adjuster(nv);
                            }
                            else {
                                adjustedNV = this[adjuster](nv);
                            }
                        }
                        const ov = this[publicPrivateStore][key];
                        if (prop.dry && ov === adjustedNV)
                            return;
                        this[publicPrivateStore][key] = adjustedNV;
                        this.propagator.dispatchEvent(new Event(key));
                    },
                    enumerable: true,
                    configurable: true,
                });
            }
        }
    }
    static config;
    static async bootUp() {
        const config = this.config;
        const { propDefaults, propInfo, wrappers } = config;
        const props = { ...this.props };
        Object.assign(props, propInfo);
        if (propDefaults !== undefined) {
            for (const key in propDefaults) {
                const def = propDefaults[key];
                const propInfo = {
                    ...defaultProp,
                    def,
                    propName: key
                };
                this.setType(propInfo, def);
                if (propInfo.type !== 'Object' && def !== true) {
                    propInfo.parse = true;
                    const { camelToLisp } = await import('../lib/camelToLisp.js');
                    propInfo.attrName = camelToLisp(key);
                }
                props[key] = propInfo;
            }
        }
        if (propInfo !== undefined) {
            for (const key in propInfo) {
                const prop = propInfo[key];
                const mergedPropInfo = {
                    ...props[key],
                    ...defaultProp,
                    ...prop,
                    propName: key
                };
                props[key] = mergedPropInfo;
                const { parse, attrName } = mergedPropInfo;
            }
        }
        this.props = props;
        this.addProps(this, props);
        if (wrappers !== undefined) {
            const { addWrappers } = await import('./addWrappers.js');
            await addWrappers(this, wrappers);
        }
    }
    static setType(prop, val) {
        if (val !== undefined) {
            if (val instanceof RegExp) {
                prop.type = 'RegExp';
            }
            else {
                let t = typeof (val);
                t = t[0].toUpperCase() + t.substr(1);
                prop.type = t;
            }
        }
    }
    static props = {};
}
const defaultProp = {
    type: 'Object',
    dry: true,
    parse: false,
};
