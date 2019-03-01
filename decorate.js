const spKey = "__transrender_deco_onPropsChange";
function assignSpecial(target, vals, propNames) {
    propNames.forEach(propName => {
        const targetProp = target[propName];
        const srcProp = vals[propName];
        Object.assign(targetProp, srcProp);
        delete vals[propName];
    });
}
function setAttribs(target, valCopy) {
    const attribs = valCopy.attribs;
    if (attribs !== undefined) {
        for (const key in attribs) {
            const attrib = attribs[key];
            switch (typeof attrib) {
                case 'string':
                    target.setAttribute(key, attrib);
                    break;
                case 'boolean':
                    if (attrib === true) {
                        target.setAttribute(key, '');
                    }
                    else {
                        target.removeAttribute(key);
                    }
            }
            if (attrib === true) {
                target.setAttribute(key, '');
            }
        }
        delete valCopy.attribs;
    }
}
export function decorate(target, vals, decor) {
    if (vals !== null) {
        const valCopy = { ...vals };
        assignSpecial(target, valCopy, ["dataset", "style"]);
        setAttribs(target, valCopy);
        Object.assign(target, valCopy);
    }
    if (decor === undefined)
        return;
    const props = decor.props;
    if (props !== undefined) {
        for (const key in props) {
            if (props[key])
                throw "Property " + key + " already exists."; //only throw error if non truthy value set.
            const propVal = props[key];
            const localSym = Symbol(key);
            Object.defineProperty(target, key, {
                get: function () {
                    return this[localSym];
                },
                set: function (val) {
                    this[localSym] = val;
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
