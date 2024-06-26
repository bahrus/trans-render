import { assignGingerly } from '../lib/assignGingerly.js';
const publicPrivateStore = Symbol();
export class O extends HTMLElement {
    propagator = new EventTarget();
    [publicPrivateStore] = {};
    covertAssignment(obj) {
        assignGingerly(this[publicPrivateStore], obj, this.constructor.props);
    }
    constructor() {
        super();
        this.#internals = this.attachInternals();
    }
    static observedAttributes = [];
    async connectedCallback() {
        const props = this.constructor.props;
        this.#propUp(props);
        await this.#instantiateRoundaboutIfApplicable();
        // const states = (<any>this.constructor).states as PropLookup;
        // if(Object.keys(states).length > 0){
        //     const {CustStSvc} = await import('./CustStSvc.js');
        //     new CustStSvc(states, this, this.#internals);
        // }
        const customStatesToReflect = getComputedStyle(this).getPropertyValue('--custom-state-exports');
        if (customStatesToReflect !== '') {
            const { CustStSvc } = await import('./CustStSvc.js');
            new CustStSvc(this, this.#internals, customStatesToReflect);
        }
        const attrsToReflect = getComputedStyle(this).getPropertyValue('--attrs-to-reflect');
        if (attrsToReflect !== '') {
            const { Reflector } = await import('./Reflector.js');
            const r = new Reflector(this, attrsToReflect);
        }
    }
    disconnectedCallback() {
        this.propagator.dispatchEvent(new Event('disconnectedCallback'));
    }
    #internals;
    #roundabout;
    get #config() {
        return this.constructor.config;
    }
    async #instantiateRoundaboutIfApplicable() {
        const config = this.#config;
        const { actions, compacts, infractions, handlers, positractions } = config;
        if ((actions || compacts || infractions || handlers || positractions) !== undefined) {
            const { roundabout } = await import('./roundabout.js');
            const [vm, ra] = await roundabout({
                vm: this,
                actions,
                compacts,
                handlers,
                positractions
            }, infractions);
            this.#roundabout = ra;
        }
    }
    #parseAttr(propInfo, name, ov, nv) {
        //TODO support memoized parse
        const { type } = propInfo;
        if (nv === null) {
            if (type === 'Boolean')
                return false;
            return undefined;
        }
        switch (type) {
            case 'Boolean':
                return true;
            case 'Number':
                return Number(nv);
            case 'Object':
                if (this.getAttribute('onload') === 'doEval') {
                    return eval(`(${nv})`);
                }
                else {
                    return JSON.parse(nv);
                }
            case 'RegExp':
                return new RegExp(nv);
            case 'String':
                return nv;
        }
    }
    /**
     * Needed for asynchronous loading
     * @param props Array of property names to "upgrade", without losing value set while element was Unknown
     * @param defaultValues:   If property value not set, set it from the defaultValues lookup
     * @private
     */
    #propUp(props) {
        for (const key in props) {
            const propInfo = props[key];
            let value = this[key];
            if (value === undefined) {
                const { def, parse, attrName } = propInfo;
                if (parse && attrName) {
                    value = this.#parseAttr(propInfo, attrName, null, this.getAttribute(attrName));
                }
                if (value === undefined)
                    value = def;
                if (value === undefined) {
                    continue;
                }
            }
            if (value !== undefined) {
                if (this.hasOwnProperty(key)) {
                    delete this[key];
                }
                this[publicPrivateStore][key] = value;
                //(<any>this)[key] = value;
            }
        }
        this.proppedUp = true;
    }
    static addProps(newClass, props) {
        const proto = newClass.prototype;
        for (const key in props) {
            if (key in proto)
                continue;
            const prop = props[key];
            const { ro, parse, attrName } = prop;
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
                        const ov = this[publicPrivateStore][key];
                        if (prop.dry && ov === nv)
                            return;
                        this[publicPrivateStore][key] = nv;
                        this.propagator.dispatchEvent(new Event(key));
                    },
                    enumerable: true,
                    configurable: true,
                });
            }
            if (parse && attrName) {
                this.observedAttributes.push(attrName);
            }
        }
    }
    #ignoreAttrChanges = false;
    set ignoreAttrChanges(nv) {
        this.#ignoreAttrChanges = nv;
    }
    attributeChangedCallback(name, oldVal, newVal) {
        if (!this.proppedUp || this.#ignoreAttrChanges)
            return;
        const attrs = this.constructor.attrs;
        const propInfo = attrs[name];
        const val = this.#parseAttr(propInfo, name, oldVal, newVal);
        this[propInfo.propName] = val;
    }
    static config;
    static async bootUp() {
        const config = this.config;
        const { propDefaults, propInfo } = config;
        const props = { ...this.props };
        const attrs = this.attrs;
        const states = this.states;
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
                if (propInfo.parse && propInfo.attrName) {
                    attrs[key] = propInfo;
                }
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
                if (parse && attrName) {
                    attrs[attrName] = mergedPropInfo;
                }
            }
        }
        this.props = props;
        this.addProps(this, props);
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
    static attrs = {};
    static states = {};
}
const defaultProp = {
    type: 'Object',
    dry: true,
    parse: false,
};
const baseConfig = {
    propDefaults: {
        proppedUp: false,
    }
};
