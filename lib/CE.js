export class CE {
    constructor(args) {
        this.args = args;
        this.defaultProp = {
            type: 'Object',
            dry: true,
            parse: true,
        };
        if (args !== undefined)
            this.def(args);
    }
    addProps(newClass, props, args) {
        const { doActions, pq, getProps, doPA } = this;
        const self = this;
        const proto = newClass.prototype;
        const config = args.config;
        const actions = config.actions;
        for (const key in props) {
            const prop = props[key];
            const privateKey = '_' + key;
            if (Object.getOwnPropertyDescriptor(proto, key) !== undefined)
                continue;
            Object.defineProperty(proto, key, {
                get() {
                    return this[privateKey];
                },
                set(nv) {
                    const ov = this[privateKey];
                    if (prop.dry && this[privateKey] === nv)
                        return;
                    const propChangeMethod = config.propChangeMethod;
                    const pcm = (propChangeMethod !== undefined ? this[propChangeMethod] : undefined);
                    //const methodIsDefined = pcm !== undefined;
                    const pci = { key, ov, nv, prop, pcm };
                    if (!doPA(self, this, pci, 'v'))
                        return;
                    this[privateKey] = nv;
                    if (this.QR) {
                        this.QR(key, this);
                        doPA(self, this, pci, '+qr');
                        return;
                    }
                    else {
                        if (!doPA(self, this, pci, '-a'))
                            return; //-a = pre actions
                    }
                    if (actions !== undefined) {
                        const filteredActions = {};
                        for (const methodName in actions) {
                            const action = actions[methodName];
                            const props = getProps(self, action); //TODO:  cache this
                            if (!props.has(key))
                                continue;
                            if (pq(self, action, this)) {
                                filteredActions[methodName] = action;
                            }
                        }
                        doActions(self, filteredActions, this, { key, ov, nv });
                    }
                    doPA(self, this, pci, '+a'); //+a = post actions
                },
                enumerable: true,
                configurable: true,
            });
        }
    }
    doPA(self, src, pci, m) {
        if (pci.pcm !== undefined)
            return pci.pcm(src, pci, m) !== false;
        return true;
    }
    createPropInfos(args) {
        const { defaultProp, setType } = this;
        const props = {};
        const defaults = Object.assign(Object.assign({}, args.complexPropDefaults), args.config.propDefaults);
        for (const key in defaults) {
            const prop = Object.assign({}, defaultProp);
            setType(prop, defaults[key]);
            props[key] = prop;
        }
        const specialProps = args.config.propInfo;
        if (specialProps !== undefined) {
            for (const key in specialProps) {
                if (props[key] === undefined) {
                    const prop = Object.assign({}, defaultProp);
                    props[key] = prop;
                }
                const prop = props[key];
                Object.assign(prop, specialProps[key]);
            }
        }
        const actions = args.config.actions;
        if (actions !== undefined) {
            for (const methodName in actions) {
                const action = actions[methodName];
                const upon = this.getProps(this, action);
                for (const dependency of upon) {
                    if (props[dependency] === undefined) {
                        const prop = Object.assign({}, defaultProp);
                        props[dependency] = prop;
                    }
                }
            }
        }
        return props;
    }
    def(args) {
        this.args = args;
        const { getAttrNames: getAttributeNames, doActions, fine, pq, toCamel, toLisp, propUp, getProps } = this;
        const self = this;
        const { config } = args;
        const { tagName, style, actions } = config;
        const propInfos = this.createPropInfos(args);
        let ext = args.superclass || HTMLElement;
        const proto = ext.prototype;
        const mixins = args.mixins;
        if (mixins !== undefined) {
            for (const mix of mixins) {
                if (typeof mix === 'function') {
                    ext = mix(ext);
                }
                else {
                    Object.assign(proto, mix);
                }
            }
        }
        class newClass extends ext {
            constructor() {
                super();
                this.attachQR();
            }
            attributeChangedCallback(n, ov, nv) {
                if (super.attributeChangedCallback)
                    super.attributeChangedCallback(n, ov, nv);
                let propName = toCamel(n);
                const prop = propInfos[propName];
                if (this.inReflectMode)
                    propName = '_' + propName;
                if (prop !== undefined) {
                    if (prop.dry && ov === nv)
                        return;
                    const aThis = this;
                    switch (prop.type) {
                        case 'String':
                            aThis[propName] = nv;
                            break;
                        case 'Object':
                            if (prop.parse) {
                                let val = nv.trim();
                                if (val !== null && ['[', '{'].includes(val[0])) {
                                    try {
                                        val = JSON.parse(val);
                                    }
                                    catch (e) { }
                                }
                                aThis[propName] = val;
                            }
                            break;
                        case 'Number':
                            aThis[propName] = Number(nv);
                            break;
                        case 'Boolean':
                            aThis[propName] = nv !== null;
                            break;
                    }
                }
            }
            connectedCallback() {
                if (super.connectedCallback)
                    super.connectedCallback();
                Object.assign(this.style, style);
                const defaults = Object.assign(Object.assign({}, args.config.propDefaults), args.complexPropDefaults);
                propUp(this, Object.keys(propInfos), defaults);
                this.detachQR();
            }
            attachQR() {
                this.QR = QR;
            }
            detachQR() {
                delete this.QR;
                const propChangeQueue = this.propChangeQueue;
                const acts = actions;
                //const actionsToDo = new Set<Action>();
                const actionsToDo = {};
                if (propChangeQueue !== undefined && acts !== undefined) {
                    for (const doAct in acts) {
                        const action = acts[doAct];
                        const props = getProps(self, action); //TODO:  Cache this
                        let actionIsApplicable = false;
                        for (const prop of props) {
                            if (propChangeQueue.has(prop)) {
                                actionIsApplicable = pq(self, action, this);
                                if (actionIsApplicable) {
                                    break;
                                }
                            }
                        }
                        if (!actionIsApplicable)
                            continue;
                        actionsToDo[doAct] = action;
                    }
                }
                doActions(self, actionsToDo, this, propChangeQueue);
                delete this.propChangeQueue;
            }
        }
        newClass.is = tagName;
        newClass.observedAttributes = getAttributeNames(propInfos, toLisp, ext);
        newClass.reactiveProps = propInfos;
        ;
        this.addProps(newClass, propInfos, args);
        fine(tagName, newClass);
        this.classDef = newClass;
        return this.classDef;
    }
    async doActions(self, actions, target, arg) {
        for (const methodName in actions) {
            const action = actions[methodName];
            if (action.debug)
                debugger;
            const ret = action.async ? await target[methodName](target) : target[methodName](target);
            if (ret === undefined)
                continue;
            self.postHoc(self, action, target, ret);
        }
    }
    fine(tagName, newClass) {
        customElements.define(tagName, newClass);
    }
    getAttrNames(props, toLisp, ext) {
        const returnArr = ext.observedAttributes || [];
        for (const key in props) {
            const prop = props[key];
            if (prop.parse) {
                returnArr.push(toLisp((key)));
            }
        }
        return returnArr;
    }
    getProps(self, action) {
        return new Set([...(action.ifAllOf || []), ...(action.ifKeyIn || [])]);
    }
    postHoc(self, action, target, returnVal) {
        Object.assign(target, returnVal);
    }
    pq(self, expr, src, ctx = { op: 'and' }) {
        const { ifAllOf } = expr;
        const { pqs } = self;
        if (ifAllOf !== undefined) {
            if (!pqs(self, ifAllOf, src, ctx))
                return false;
        }
        return true;
    }
    pqsv(self, src, subExpr, ctx) {
        return !!src[subExpr];
    }
    pqs(self, expr, src, ctx) {
        for (const subExpr of expr) {
            if (!self.pqsv(self, src, subExpr, ctx))
                return false;
        }
        return true;
    }
    /**
     * Needed for asynchronous loading
     * @param props Array of property names to "upgrade", without losing value set while element was Unknown
     * @param defaultValues:   If property value not set, set it from the defaultValues lookup
     * @private
     */
    propUp(self, props, defaultValues) {
        for (const prop of props) {
            let value = self[prop];
            if (value === undefined && defaultValues !== undefined) {
                value = defaultValues[prop];
            }
            if (self.hasOwnProperty(prop)) {
                delete self[prop];
            }
            //some properties are read only.
            try {
                self[prop] = value;
            }
            catch (_a) { }
        }
    }
    setType(prop, val) {
        if (val !== undefined) {
            let t = typeof (val);
            t = t[0].toUpperCase() + t.substr(1);
            prop.type = t;
        }
    }
    toLisp(s) { return s.split(ctlRe).join('-').toLowerCase(); }
    toCamel(s) { return s.replace(stcRe, function (m) { return m[1].toUpperCase(); }); }
}
const QR = (propName, self) => {
    if (self.propChangeQueue === undefined)
        self.propChangeQueue = new Set();
    self.propChangeQueue.add(propName);
};
const ctlRe = /(?=[A-Z])/;
const stcRe = /(\-\w)/g;
