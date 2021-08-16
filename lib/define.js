import { def } from './def.js';
import { propUp } from './propUp.js';
import { camelToLisp } from './camelToLisp.js';
import { lispToCamel } from './lispToCamel.js';
export { camelToLisp } from './camelToLisp.js';
export function define(args) {
    const c = args.config;
    const propInfos = createPropInfos(args);
    let ext = args.superclass || HTMLElement;
    const mixins = args.mixins;
    if (mixins !== undefined) {
        for (const mix of mixins) {
            if (typeof mix === 'function') {
                ext = mix(ext);
            }
        }
    }
    class newClass extends ext {
        constructor() {
            super();
            this.subscribers = [];
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
            //TODO merge attributes?
            const defaults = { ...args.config.propDefaults, ...args.complexPropDefaults };
            // for(const key in defaults){
            //     (<any>this)[key] = defaults[key];
            // }
            propUp(this, Object.keys(propInfos), defaults);
            this.detachQR();
            if (c.initMethod !== undefined) {
                this[c.initMethod](this);
            }
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
                                actionsToDo.add(doAct);
                            }
                            break;
                        case 'object':
                            for (const dependency of upon) {
                                if (propChangeQueue.has(dependency)) {
                                    actionsToDo.add(doAct);
                                    break;
                                }
                            }
                            break;
                    }
                }
            }
            const values = Array.from(actionsToDo);
            for (const action of values) {
                this[action](this);
            }
            delete this.propChangeQueue;
        }
        subscribe(propsOfInterest, callBack) {
            this.subscribers.push({ propsOfInterest, callBack });
        }
        unsubscribe(propsOfInterest, callBack) {
            const idx = this.subscribers.findIndex(s => s.propsOfInterest === propsOfInterest && s.callBack === callBack);
            if (idx > -1)
                this.subscribers.splice(idx, 1);
        }
    }
    newClass.is = c.tagName;
    newClass.observedAttributes = getAttributeNames(propInfos);
    if (mixins !== undefined) {
        const proto = newClass.prototype;
        for (const mix of mixins) {
            if (typeof mix === 'object') {
                Object.assign(proto, mix);
            }
        }
    }
    addPropsToClass(newClass, propInfos, args);
    def(newClass);
    return newClass;
}
function getAttributeNames(props) {
    const returnArr = [];
    for (const key in props) {
        const prop = props[key];
        if (prop.parse) {
            returnArr.push(camelToLisp(key));
        }
    }
    return returnArr;
}
const defaultProp = {
    type: 'Object',
    dry: true,
    parse: true,
};
function setType(prop, val) {
    if (val !== undefined) {
        let t = typeof (val);
        t = t[0].toUpperCase() + t.substr(1);
        prop.type = t;
    }
}
function createPropInfos(args) {
    const props = {};
    const defaults = { ...args.complexPropDefaults, ...args.config.propDefaults };
    for (const key in defaults) {
        const prop = { ...defaultProp };
        setType(prop, defaults[key]);
        props[key] = prop;
    }
    const specialProps = args.config.propInfo;
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
    const actions = args.config.actions;
    if (actions !== undefined) {
        for (const action of actions) {
            const upon = action.upon;
            if (upon === undefined)
                continue;
            for (const dependency of upon) {
                if (props[dependency] === undefined) {
                    const prop = { ...defaultProp };
                    props[dependency] = prop;
                }
            }
        }
    }
    return props;
}
function addPropsToClass(newClass, props, args) {
    const proto = newClass.prototype;
    const actions = args.config.actions;
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
                this[privateKey] = nv;
                for (const subscriber of this.subscribers) {
                    if (subscriber.propsOfInterest.has(key)) {
                        subscriber.callback(this);
                    }
                }
                if (this.QR) {
                    this.QR(key, this);
                    return;
                }
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
                    for (const action of filteredActions) {
                        const fn = this[action.do];
                        if (fn === undefined)
                            throw (action.do.toString() + " undefined");
                        this[action.do](this, key, ov, nv);
                    }
                }
            },
            enumerable: true,
            configurable: true,
        });
    }
}
function checkRifs(action, self) {
    const { riff, rift, upon } = action;
    if (riff !== undefined) {
        const realRiff = (riff === '"' || riff === "'") ? upon : riff;
        for (const key of realRiff) {
            if (!self[key])
                return false;
        }
    }
    if (rift !== undefined) {
        for (const key of rift) {
            if (self[key])
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