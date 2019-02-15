export function decorate(ctx, target, src) {
    const propVals = src.propVals;
    if (propVals !== undefined) {
        let dataset = propVals.dataset;
        if (dataset !== undefined) {
            delete propVals.dataset;
        }
        Object.assign(target, src);
        if (dataset !== undefined) {
            Object.assign(target.dataset, dataset);
        }
    }
    if (ctx !== undefined && ctx.update)
        return;
    const props = src.props;
    if (props !== undefined) {
        for (const key in props) {
            const propVal = props[key];
            Object.defineProperty(target, key, {
                get: function () {
                    return this['_' + key];
                },
                set: function (val) {
                    this['_' + key] = val;
                    const eventName = key + '-changed';
                    const newEvent = new CustomEvent(eventName, {
                        detail: {
                            value: val
                        },
                        bubbles: true,
                        composed: false,
                    });
                    this.dispatchEvent(newEvent);
                    //if(this[spKey]) this[spKey](key, val);
                },
                enumerable: true,
                configurable: true,
            });
            target[key] = propVal;
        }
    }
    const methods = src.methods;
    if (methods !== undefined) {
        for (const key in props) {
            const method = props[key];
            const prop = Object.defineProperty(target, key, {
                enumerable: false,
                configurable: true,
                writable: true,
                value: method,
            });
        }
    }
    const events = src.on;
    if (events) {
        for (const key in events) {
            const handlerKey = key + '_transRenderHandler';
            const prop = Object.defineProperty(target, handlerKey, {
                enumerable: false,
                configurable: true,
                writable: true,
                value: events[key],
            });
            target.addEventListener(key, target[handlerKey]);
        }
    }
}
