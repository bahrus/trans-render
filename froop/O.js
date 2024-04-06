import { camelToLisp } from '../lib/camelToLisp.js';
const publicPrivateStore = Symbol();
export class O extends HTMLElement {
    propagator = new EventTarget();
    [publicPrivateStore] = {};
    covertAssignment(obj) {
        Object.assign(this[publicPrivateStore], obj);
    }
    constructor() {
        super();
        this.#internals = this.attachInternals();
    }
    static observedAttributes = [];
    async connectedCallback() {
        const props = this.constructor.props;
        this.#propUp(props);
        await this.#mount();
    }
    disconnectedCallback() {
        this.propagator.dispatchEvent(new Event('unload'));
    }
    #internals;
    // get internals(){
    // }
    async #mount() {
        const config = this.constructor.config;
        const { actions, compacts } = config;
        if (actions !== undefined) {
            const { roundabout } = await import('./roundabout.js');
            await roundabout(this, {
                //propagator: this.propagator,
                actions,
                compacts
            });
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
                return JSON.parse(nv);
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
                        const customState = prop.css;
                        if (customState !== undefined) {
                            //wrong!  we cannot do any special logic inside the setter because being roundabout ready means 
                            //setters avoided often in favor of just dispatching events.
                            const customStateObj = typeof customState === 'string' ? {
                                nameValue: customState,
                            } : customState;
                            const { nameValue, falsy, truthy } = customStateObj;
                            const internals = this.#internals;
                            if (nameValue !== undefined && nv !== undefined) {
                                const valAsLisp = camelToLisp(nv.toString());
                                internals.states.add(`--${nameValue}-${valAsLisp}`);
                            }
                            if (truthy) {
                                const verb = nv ? 'add' : 'remove';
                                internals.states[verb](`--${truthy}`);
                            }
                            if (falsy) {
                                const verb = nv ? 'remove' : 'add';
                                internals.states[verb](`--${falsy}`);
                            }
                        }
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
    attributeChangedCallback(name, oldVal, newVal) {
        if (!this.proppedUp)
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
        const props = { ...this.props, ...propInfo };
        const attrs = this.attrs;
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
                if (propInfo.type !== 'Object') {
                    propInfo.parse = true;
                    //const {camelToLisp} = await import('../lib/camelToLisp.js');
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
                prop.propName = key;
                const { parse, attrName } = prop;
                if (parse && attrName) {
                    attrs[attrName] = prop;
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
