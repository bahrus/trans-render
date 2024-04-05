const publicPrivateStore = Symbol();
export class O extends HTMLElement {
    propagator = new EventTarget();
    [publicPrivateStore] = {};
    covertAssignment(obj) {
        Object.assign(this[publicPrivateStore], obj);
    }
    constructor() {
        super();
    }
    async connectedCallback() {
        const props = this.constructor.props;
        this.#propUp(props);
        await this.mount();
    }
    async mount() {
        const config = this.constructor.config;
        const { actions } = config;
        if (actions !== undefined) {
            const { roundabout } = await import('./roundabout.js');
            await roundabout(this, {
                //propagator: this.propagator,
                actions
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
                this[key] = value;
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
            if (prop.ro) {
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
        }
    }
    attributeChangedCallback(name, oldVal, newVal) {
        if (!this.proppedUp)
            return;
        const config = this.constructor.config;
        // const newAttrs = this.#newAttrs;
        // const filteredAttrs = this.#filteredAttrs;
        // newAttrs[name] = {oldVal, newVal};
        // if(newVal === null){
        //     delete filteredAttrs[name];
        // }else{
        //     filteredAttrs[name] =newVal;
        // }
        // //TODO:  optimize this
        // if(this.#checkIfAttrsAreParsed()){
        //     services!.definer.dispatchEvent(new CustomEvent(acb, {
        //         detail: {
        //             instance: this as any as HTMLElement,
        //             newAttrs,
        //             filteredAttrs
        //         }  as IAttrChgCB
        //     }));
        //     this.#newAttrs = {};
        // }else{
        //     this.isAttrParsed = false;
        // }
    }
    static config;
    static async bootUp() {
        const config = this.config;
        const { propDefaults } = config;
        if (propDefaults !== undefined) {
            const props = this.props;
            for (const key in propDefaults) {
                const def = propDefaults[key];
                const propInfo = {
                    ...defaultProp,
                    def
                };
                this.setType(propInfo, def);
                props[key] = propInfo;
            }
            this.addProps(this, props);
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
    parse: true,
};
const baseConfig = {
    propDefaults: {
        proppedUp: false,
    }
};
