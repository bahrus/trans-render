const spKey = '__transrender_deco_onPropsChange';
export function decorate(ctx, target, src) {
    const propVals = src.PropVals;
    if (propVals !== undefined) {
        let dataset = propVals.dataset;
        if (dataset !== undefined) {
            delete propVals.dataset;
        }
        Object.assign(target, propVals);
        if (dataset !== undefined) {
            Object.assign(target.dataset, dataset);
        }
    }
    if (ctx !== undefined && ctx.update)
        return;
    const props = src.Props;
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
                    if (this[spKey])
                        this[spKey](key, val);
                },
                enumerable: true,
                configurable: true,
            });
            target[key] = propVal;
        }
    }
    const methods = src.Methods;
    if (methods !== undefined) {
        for (const key in methods) {
            const method = methods[key];
            const fnKey = (key === 'onPropsChange') ? spKey : key;
            Object.defineProperty(target, fnKey, {
                enumerable: false,
                configurable: true,
                writable: true,
                value: method,
            });
        }
    }
    const events = src.On;
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
