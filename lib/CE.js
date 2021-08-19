import { def } from './def.js';
import { propUp } from './propUp.js';
import { camelToLisp } from './camelToLisp.js';
import { lispToCamel } from './lispToCamel.js';
export class CE {
    constructor() {
        this.defaultProp = {
            type: 'Object',
            dry: true,
            parse: true,
        };
    }
    def(args) {
        const { createPropInfos, getAttributeNames, doActions, addPropsToClass } = this;
        const c = args.config;
        const propInfos = createPropInfos(args);
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
                const propName = lispToCamel(n);
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
                Object.assign(this.style, c.style);
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
                const actions = c.actions;
                const actionsToDo = new Set();
                if (propChangeQueue !== undefined && actions !== undefined) {
                    for (const action of actions) {
                        const { upon } = action;
                        const doAct = action.do;
                        if (upon === undefined)
                            continue;
                        if (!checkRifs(action, this))
                            continue;
                        switch (typeof upon) {
                            case 'string':
                                if (propChangeQueue.has(upon)) {
                                    actionsToDo.add(action);
                                }
                                break;
                            case 'object':
                                for (const dependency of upon) {
                                    if (propChangeQueue.has(dependency)) {
                                        actionsToDo.add(action);
                                        break;
                                    }
                                }
                                break;
                        }
                    }
                }
                const values = Array.from(actionsToDo);
                doActions(values, this, propChangeQueue);
                delete this.propChangeQueue;
            }
        }
        newClass.is = c.tagName;
        newClass.observedAttributes = getAttributeNames(propInfos);
        addPropsToClass(newClass, propInfos, args);
        def(newClass);
        return newClass;
    }
    async doActions(actions, self, arg) {
        for (const action of actions) {
            const fn = self[action.do];
            const ret = action.async ? await fn(self, arg) : fn(self, arg);
            if (action.merge)
                Object.assign(self, ret);
        }
    }
    getAttributeNames(props) {
        const returnArr = [];
        for (const key in props) {
            const prop = props[key];
            if (prop.parse) {
                returnArr.push(camelToLisp(key));
            }
        }
        return returnArr;
    }
    setType(prop, val) {
        if (val !== undefined) {
            let t = typeof (val);
            t = t[0].toUpperCase() + t.substr(1);
            prop.type = t;
        }
    }
    createPropInfos(args) {
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
            for (const action of actions) {
                const upon = action.upon;
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
        const { doActions } = this;
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
                    //TODO:  turn this into mixin
                    // for(const subscriber of this.subscribers){
                    //     if(subscriber.propsOfInterest.has(key)){
                    //         subscriber.callback(this);
                    //     }
                    // }
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
                        const filteredActions = actions.filter(x => {
                            if (!checkRifs(x, this))
                                return false;
                            const upon = x.upon;
                            switch (typeof upon) {
                                case 'string':
                                    return upon === key;
                                case 'object':
                                    return upon.includes(key);
                            }
                        });
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
}
function checkRifs(action, self) {
    const { riff, upon } = action;
    if (riff !== undefined) {
        const realRiff = (riff === '"' || riff === "'") ? upon : riff;
        for (const key of realRiff) {
            if (!self[key])
                return false;
        }
    }
    return true;
}
const QR = (propName, self) => {
    if (self.propChangeQueue === undefined)
        self.propChangeQueue = new Set();
    self.propChangeQueue.add(propName);
};
