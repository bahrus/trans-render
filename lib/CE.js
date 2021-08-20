export class CE {
    constructor() {
        this.defaultProp = {
            type: 'Object',
            dry: true,
            parse: true,
        };
    }
    def(args) {
        const { getAttributeNames, doActions, fine, pq, toCamel, toLisp, propUp } = this;
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
                const propName = toCamel(n);
                const prop = propInfos[propName];
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
                                aThis[propName] = JSON.parse(nv);
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
                        if (!pq(action, self, this, 'and'))
                            continue;
                        actionsToDo[doAct] = action;
                        // switch(typeof upon){
                        //     case 'string':
                        //         if(propChangeQueue.has(upon)){
                        //             actionsToDo[doAct] = action;
                        //             //actionsToDo.add(action);
                        //         }
                        //         break;
                        //     case 'object':
                        //         for(const dependency of upon){
                        //             if(propChangeQueue.has(dependency)){
                        //                 //actionsToDo.add(action);
                        //                 actionsToDo[doAct] = action;
                        //                 break;
                        //             }
                        //         }
                        //         break;
                        // }
                    }
                }
                doActions(actionsToDo, this, propChangeQueue);
                delete this.propChangeQueue;
            }
        }
        newClass.is = tagName;
        newClass.observedAttributes = getAttributeNames(propInfos, toLisp);
        this.addPropsToClass(newClass, propInfos, args);
        fine(tagName, newClass);
        return newClass;
    }
    fine(tagName, newClass) {
        customElements.define(tagName, newClass);
    }
    async doActions(actions, self, arg) {
        for (const methodName in actions) {
            const fn = self[methodName].bind(self);
            const action = actions[methodName];
            const ret = action.async ? await fn(self, arg) : fn(self, arg);
            if (action.merge)
                Object.assign(self, ret);
        }
    }
    getAttributeNames(props, toLisp) {
        const returnArr = [];
        for (const key in props) {
            const prop = props[key];
            if (prop.parse) {
                returnArr.push(toLisp((key)));
            }
        }
        return returnArr;
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
                const upon = action.ifAnyOf;
                if (upon === undefined)
                    continue;
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
    addPropsToClass(newClass, props, args) {
        const { doActions, pq } = this;
        const self = this;
        const proto = newClass.prototype;
        const config = args.config;
        const actions = config.actions;
        for (const key in props) {
            const prop = props[key];
            const privateKey = '_' + key;
            Object.defineProperty(proto, key, {
                get() {
                    return this[privateKey];
                },
                set(nv) {
                    const ov = this[privateKey];
                    if (prop.dry && this[privateKey] === nv)
                        return;
                    const propChangeMethod = config.propChangeMethod;
                    const thisPropChangeMethod = (propChangeMethod !== undefined ? this[propChangeMethod] : undefined);
                    const methodIsDefined = thisPropChangeMethod !== undefined;
                    const arg = { key, ov, nv, prop };
                    if (methodIsDefined)
                        if (thisPropChangeMethod(this, arg, 'v') === false)
                            return; //v = validate
                    this[privateKey] = nv;
                    if (this.QR) {
                        this.QR(key, this);
                        if (methodIsDefined)
                            thisPropChangeMethod(this, arg, '+qr');
                        return;
                    }
                    if (methodIsDefined)
                        if (thisPropChangeMethod(this, arg, '-a') === false)
                            return; //-a = pre actions
                    if (actions !== undefined) {
                        const filteredActions = {};
                        for (const methodName in actions) {
                            const action = actions[methodName];
                            if (self.pq(action, self, this, 'and')) {
                                const upon = action.ifAnyOf;
                                if (upon.includes(key)) {
                                    filteredActions[methodName] = action;
                                }
                                break;
                            }
                        }
                        doActions(filteredActions, this, { key, ov, nv });
                    }
                    if (methodIsDefined)
                        thisPropChangeMethod(this, arg, '+a'); //+a = post actions
                },
                enumerable: true,
                configurable: true,
            });
        }
    }
    pq(expr, self, src, op) {
        let answer = op === 'and' ? true : false;
        for (const logicalOp in expr) {
            const rhs = expr[logicalOp];
            if (!Array.isArray(rhs))
                throw 'NI'; //not implemented
            let arrayLogicalOp = 'and';
            if (logicalOp.endsWith('AnyOf'))
                arrayLogicalOp = 'or';
            const subAnswer = self.pqs(rhs, self, src, arrayLogicalOp);
            switch (op) {
                case 'and':
                    if (!subAnswer)
                        return false;
                    break;
                case 'or':
                    if (subAnswer)
                        return true;
                    break;
            }
        }
        // const {riff, upon} = action;
        // if(riff !== undefined){
        //     const realRiff = (riff === '"' || riff === "'") ? upon! : riff;
        //     for(const key of realRiff){
        //         if(!self[key]) return false;
        //     }
        // }
        return answer;
    }
    pqs(expr, self, src, op) {
        let answer = op === 'and' ? true : false;
        for (const subExpr of expr) {
            let subAnswer = false;
            switch (typeof subExpr) {
                case 'string':
                    subAnswer = !!src[subExpr];
                    break;
                case 'object':
                    subAnswer = self.pq(subExpr, self, src, 'and');
                    break;
                default:
                    throw 'NI'; //Not Implemented
            }
            switch (op) {
                case 'and':
                    if (!subAnswer)
                        return false;
                    break;
                case 'or':
                    if (subAnswer)
                        return true;
                    break;
            }
        }
        return answer;
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
