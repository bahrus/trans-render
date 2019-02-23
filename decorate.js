const spKey = "__transrender_deco_onPropsChange";
function assignSpecial(target, vals, propNames) {
    propNames.forEach(propName => {
        const targetProp = target[propName];
        const srcProp = vals[propName];
        Object.assign(targetProp, srcProp);
        delete vals[propName];
    });
}
class Actions {
    constructor(el) {
        this.el = el;
    }
    /**
     * Set attribute value.
     * @param name
     * @param val
     * @param trueVal String to set attribute if true.
     */
    attr(name, val, trueVal) {
        const v = val ? "set" : "remove"; //verb
        this.el[v + "Attribute"](name, trueVal || val);
        return this;
    }
    transform(transform) {
        return transform;
    }
    get void() {
        return undefined;
    }
}
export function decorate(target, vals, decor) {
    if (vals !== null) {
        const valCopy = { ...vals };
        assignSpecial(target, valCopy, ["dataset", "style"]);
        Object.assign(target, valCopy);
        //classes?
    }
    if (decor === undefined)
        return;
    const props = decor.props;
    if (props !== undefined) {
        for (const key in props) {
            if (props[key])
                throw "Property " + key + " already exists."; //only throw error if non truthy value set.
            const propVal = props[key];
            Object.defineProperty(target, key, {
                get: function () {
                    return this["_" + key];
                },
                set: function (val) {
                    this["_" + key] = val;
                    const eventName = key + "-changed";
                    const newEvent = new CustomEvent(eventName, {
                        detail: {
                            value: val
                        },
                        bubbles: true,
                        composed: false
                    });
                    this.dispatchEvent(newEvent);
                    if (this[spKey])
                        this[spKey](key, val);
                },
                enumerable: true,
                configurable: true
            });
            target[key] = propVal;
        }
    }
    const methods = decor.methods;
    if (methods !== undefined) {
        for (const key in methods) {
            const method = methods[key];
            const fnKey = key === "onPropsChange" ? spKey : key;
            Object.defineProperty(target, fnKey, {
                enumerable: false,
                configurable: true,
                writable: true,
                value: method
            });
        }
    }
    const events = decor.on;
    if (events) {
        for (const key in events) {
            const handlerKey = key + "_transRenderHandler";
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
