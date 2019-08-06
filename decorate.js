import { domMerge } from './domMerge.js';
const evCount = Symbol('evtCount');
const handlerKey = Symbol('handlerKey');
/**
 * Turn number into string with even and odd values easy to query via css.
 * @param n
 */
function to$(n) {
    const mod = n % 2;
    return (n - mod) / 2 + '-' + mod;
}
/**
 * Increment event count
 * @param name
 */
function incAttr(name, target) {
    const ec = target[evCount];
    if (name in ec) {
        ec[name]++;
    }
    else {
        ec[name] = 0;
    }
    target.setAttribute('data-' + name, to$(ec[name]));
}
function defProp(key, props, target, onPropsChange) {
    const propVal = props[key];
    const keyS = key.toString();
    const localSym = Symbol(key.toString());
    Object.defineProperty(target, key, {
        get: function () {
            return this[localSym];
        },
        set: function (val) {
            const oldVal = this[localSym];
            if ((oldVal === null || oldVal === undefined) && (val === oldVal))
                return;
            this[localSym] = val;
            const eventName = keyS.replace('(', '-').replace(')', '') + "-changed";
            const newEvent = new CustomEvent(eventName, {
                detail: {
                    value: val
                },
                bubbles: true,
                composed: false
            });
            this.dispatchEvent(newEvent);
            //this.dataset[]
            //if(this.toggleAttribute) this.toggleAttribute('data-' + eventName);
            incAttr(eventName, target);
            if (this[onPropsChange])
                this[onPropsChange](key, val, oldVal);
            //if (this[spKey]) this[spKey](key, val);
        },
        enumerable: true,
        configurable: true
    });
    target[key] = propVal;
}
function defMethod(key, methods, target, onPropsChange) {
    const method = methods[key];
    const fnKey = key === "onPropsChange" ? onPropsChange : key;
    Object.defineProperty(target, fnKey, {
        enumerable: false,
        configurable: true,
        writable: true,
        value: method
    });
}
export function decorate(target, source) {
    const onPropsChange = Symbol('onPropChange');
    domMerge(target, source);
    const props = source.propDefs;
    if (props !== undefined) {
        target[evCount] = {};
        for (const key in props) {
            //if (props[key]) throw "Property " + key + " already exists."; //only throw error if non truthy value set.
            defProp(key, props, target, onPropsChange);
        }
        for (const key of Object.getOwnPropertySymbols(props)) {
            defProp(key, props, target, onPropsChange);
        }
    }
    const methods = source.methods;
    if (methods !== undefined) {
        for (const key in methods) {
            defMethod(key, methods, target, onPropsChange);
        }
        for (const key of Object.getOwnPropertySymbols(methods)) {
            defProp(key, methods, target, onPropsChange);
        }
    }
    const events = source.on;
    if (events) {
        for (const key in events) {
            //const handlerKey = key + "_transRenderHandler";  //TODO  : symbolize
            const prop = Object.defineProperty(target, handlerKey, {
                enumerable: false,
                configurable: true,
                writable: true,
                value: events[key]
            });
            target.addEventListener(key, target[handlerKey]);
        }
    }
}
