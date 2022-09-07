import { def } from './def.js';
//import { doActions } from './doActions.js';
export class CE {
    args;
    constructor(args) {
        this.args = args;
        if (args !== undefined) {
            this.#evalConfig(this).then(() => {
                this.def(args);
            });
        }
    }
    async #evalConfig({ args }) {
        if (args === undefined)
            return;
        const { config } = args;
        if (typeof config != 'function')
            return;
        args.config = (await config()).default;
    }
    defaultProp = {
        type: 'Object',
        dry: true,
        parse: true,
    };
    act2Props = {};
    doPA(self, src, pci, m) { }
    async #createPropInfos(args) {
        const { defaultProp, setType } = this;
        const config = args.config;
        const props = {};
        const defaults = { ...args.complexPropDefaults, ...config.propDefaults };
        for (const key in defaults) {
            const prop = { ...defaultProp };
            setType(prop, defaults[key]);
            props[key] = prop;
        }
        const specialProps = config.propInfo;
        if (specialProps !== undefined) {
            for (const key in specialProps) {
                if (props[key] === undefined) {
                    const prop = { ...defaultProp };
                    props[key] = prop;
                }
                const prop = props[key];
                Object.assign(prop, specialProps[key]);
            }
        }
        const actions = config.actions;
        if (actions !== undefined) {
            for (const methodName in actions) {
                const action = actions[methodName];
                const typedAction = (typeof action === 'string') ? { ifAllOf: [action] } : action;
                const upon = this.getProps(this, typedAction);
                for (const dependency of upon) {
                    if (props[dependency] === undefined) {
                        const prop = { ...defaultProp };
                        props[dependency] = prop;
                    }
                }
            }
        }
        await this.api(args, props);
        return props;
    }
    async api(args, props) {
        //overridable placeholder for adding additional props
    }
    classDef;
    async def(args) {
        this.args = args;
        await this.#evalConfig(this);
        const { getAttrNames: getAttributeNames, doActions, fine, pq, toCamel, toLisp, propUp, getProps } = this;
        const self = this;
        const { config } = args;
        const { tagName, style, actions } = config;
        const propInfos = await this.#createPropInfos(args);
        let ext = (args.superclass || HTMLElement);
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
            static is = tagName;
            static observedAttributes = getAttributeNames(propInfos, toLisp, ext);
            static reactiveProps = propInfos;
            static ceDef = args;
            static formAssociated = config.formAss;
            constructor() {
                super();
                this.internals_ = this.attachInternals();
                this.attachQR();
            }
            #mergedActions;
            get mergedActions() {
                if (this.#mergedActions === undefined) {
                    this.#mergedActions = super.mergedActions || {};
                    Object.assign(this.#mergedActions, actions);
                }
                return this.#mergedActions;
            }
            #values = {};
            getValues() {
                return this.#values;
            }
            attributeChangedCallback(n, ov, nv) {
                if (super.attributeChangedCallback)
                    super.attributeChangedCallback(n, ov, nv);
                if (n === 'defer-hydration' && nv === null && ov !== null) {
                    this.detachQR();
                }
                let propName = toCamel(n);
                const prop = propInfos[propName];
                //if(this.inReflectMode) propName = '_' + propName;
                if (prop !== undefined) {
                    if (prop.dry && ov === nv)
                        return;
                    const aThis = this.inReflectMode ? this.#values : this;
                    switch (prop.type) {
                        case 'String':
                            aThis[propName] = nv;
                            break;
                        case 'Object':
                            if (prop.parse) {
                                let val = nv.trim();
                                if (val !== null) {
                                    try {
                                        val = JSON.parse(val);
                                    }
                                    catch (e) {
                                        console.error({ val, e });
                                    }
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
                        case 'RegExp':
                            aThis[propName] = new RegExp(nv);
                            break;
                    }
                }
            }
            async connectedCallback(myArgs = undefined) {
                Object.assign(this.style, style);
                const args = myArgs || this.constructor.ceDef;
                const defaults = { ...args.config.propDefaults, ...args.complexPropDefaults };
                propUp(this, Object.keys(propInfos), defaults);
                if (super.connectedCallback)
                    super.connectedCallback(super.constructor.ceDef);
                await this.detachQR();
            }
            attachQR() {
                this.QR = QR;
            }
            async detachQR() {
                if (this.hasAttribute('defer-hydration'))
                    return;
                delete this.QR;
                const propChangeQueue = this.propChangeQueue;
                const acts = this.mergedActions;
                const actionsToDo = {};
                if (propChangeQueue !== undefined && acts !== undefined) {
                    for (const doAct in acts) {
                        let action = acts[doAct];
                        if (typeof action === 'string') {
                            action = { ifAllOf: [action] };
                        }
                        const props = getProps(self, action); //TODO:  Cache this
                        let actionIsApplicable = false;
                        for (const prop of props) {
                            if (propChangeQueue.has(prop)) {
                                actionIsApplicable = await pq(self, action, this);
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
                await doActions(self, actionsToDo, this);
                delete this.propChangeQueue;
            }
            setValsQuietly(vals) {
                for (const key in vals) {
                    this['_' + key] = vals[key];
                }
            }
        }
        ;
        if (Object.keys(propInfos).length > 0) {
            const { addProps } = await import('./addProps.js');
            await addProps(this, newClass, propInfos, args);
        }
        fine(tagName, newClass);
        this.classDef = newClass;
        return this.classDef;
    }
    async doActions(self, actions, target, proxy) {
        const { doActions } = await import('./doActions.js');
        await doActions(self, actions, target, proxy);
    }
    fine(tagName, newClass) {
        def(newClass);
    }
    getAttrNames(props, toLisp, ext) {
        const returnArr = ext.observedAttributes || [];
        for (const key in props) {
            const prop = props[key];
            if (prop.parse) {
                returnArr.push(toLisp((key)));
            }
        }
        returnArr.push('defer-hydration');
        return returnArr;
    }
    //better name:  getPropsFromActions
    getProps(self, action) {
        return typeof (action) === 'string' ? new Set([action]) : new Set([...(action.ifAllOf || []), ...(action.ifKeyIn || [])]);
    }
    async postHoc(self, action, target, returnVal, proxy) {
        const dest = proxy !== undefined ? proxy : target;
        Object.assign(dest, returnVal);
        const setFree = action.setFree;
        if (setFree !== undefined) {
            for (const key of setFree) {
                dest[key] = undefined;
            }
        }
    }
    async pq(self, expr, src, ctx = { op: 'and' }) {
        const { ifAllOf } = expr;
        const { pqs } = self;
        if (ifAllOf !== undefined) {
            const { all } = await import('./all.js');
            if (!await all(ifAllOf, src, ctx))
                return false;
            //if(!await pqs(self, ifAllOf as ListOfLogicalExpressions, src, ctx)) return false;
        }
        return true;
    }
    async pqsv(self, src, subExpr, ctx) {
        return !!src[subExpr];
    }
    async pqs(self, expr, src, ctx) {
        for (const subExpr of expr) {
            if (!await self.pqsv(self, src, subExpr, ctx))
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
            catch { }
        }
    }
    setType(prop, val) {
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
