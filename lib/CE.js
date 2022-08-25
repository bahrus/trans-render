import { def } from './def.js';
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
    addProps(newClass, props, args) {
        const { doActions, pq, getProps, doPA, act2Props } = this;
        const self = this;
        const proto = newClass.prototype;
        const config = args.config;
        //const actions = this.mergedActions;
        for (const key in props) {
            const prop = props[key];
            const privateKey = '_' + key;
            if (key in proto)
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
                    if (!(doPA(self, this, pci, 'v')))
                        return;
                    this[privateKey] = nv;
                    if (this.isInQuietMode) {
                        doPA(self, this, pci, '+qm');
                    }
                    if (this.QR) {
                        this.QR(key, this);
                        doPA(self, this, pci, '+qr');
                        return;
                    }
                    else {
                        if (!(doPA(self, this, pci, '-a')))
                            return; //-a = pre actions
                    }
                    const actions = this.mergedActions;
                    if (actions !== undefined) {
                        const filteredActions = {};
                        for (const methodName in actions) {
                            let action = actions[methodName];
                            if (typeof (action) === 'string') {
                                action = { ifAllOf: [action] };
                            }
                            let props = act2Props[methodName];
                            if (props === undefined) {
                                props = getProps(self, action);
                                act2Props[methodName] = props;
                            }
                            if (!props.has(key))
                                continue;
                            if (pq(self, action, this)) {
                                filteredActions[methodName] = action;
                            }
                        }
                        (async () => {
                            await doActions(self, filteredActions, this);
                            doPA(self, this, pci, '+a'); //+a = post actions
                        })();
                    }
                    else {
                        doPA(self, this, pci, '+a'); //+a = post actions
                    }
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
            attributeChangedCallback(n, ov, nv) {
                if (super.attributeChangedCallback)
                    super.attributeChangedCallback(n, ov, nv);
                if (n === 'defer-hydration' && nv === null && ov !== null) {
                    this.detachQR();
                }
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
        this.addProps(newClass, propInfos, args);
        fine(tagName, newClass);
        this.classDef = newClass;
        return this.classDef;
    }
    // #actionQueue: {[methodName: string]: Action} = {};
    // #actionsInProgress = false;
    // #actionsInQueue = false; 
    #QLookup = new WeakMap();
    async doActions(self, actions, target, proxy) {
        if (!self.#QLookup.has(target)) {
            self.#QLookup.set(target, new Q());
        }
        const q = self.#QLookup.get(target);
        if (q.aip) {
            Object.assign(q.aq, actions);
            q.aiq = true;
            return;
        }
        q.aip = true;
        for (const methodName in actions) {
            const action = actions[methodName];
            if (action.debug)
                debugger;
            //https://lsm.ai/posts/7-ways-to-detect-javascript-async-function/#:~:text=There%205%20ways%20to%20detect%20an%20async%20function,name%20property%20of%20the%20AsyncFunction%20is%20%E2%80%9CAsyncFunction%E2%80%9D.%202.
            const method = target[methodName];
            if (method === undefined) {
                throw {
                    message: 404,
                    methodName,
                    target,
                };
            }
            const isAsync = method.constructor.name === 'AsyncFunction';
            const ret = isAsync ? await target[methodName](target) : target[methodName](target);
            if (ret === undefined)
                continue;
            await self.postHoc(self, action, target, ret, proxy);
        }
        q.aip = false;
        if (q.aiq) {
            q.aiq = false;
            const actionQueue = { ...q.aq };
            q.aq = {};
            await self.doActions(self, actionQueue, target, proxy);
        }
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
class Q {
    aq = {}; //actionsQueue
    aip = false; //actions in progress
    aiq = false; //actionsInQueue
}
const QR = (propName, self) => {
    if (self.propChangeQueue === undefined)
        self.propChangeQueue = new Set();
    self.propChangeQueue.add(propName);
};
const ctlRe = /(?=[A-Z])/;
const stcRe = /(\-\w)/g;
