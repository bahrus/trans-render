const propSubscribers = new WeakMap();
export async function subscribe(element, propName, callback) {
    if (element.localName.includes('-')) {
        await customElements.whenDefined(element.localName);
    }
    if (!propSubscribers.has(element)) {
        propSubscribers.set(element, {});
    }
    const subscribers = propSubscribers.get(element);
    if (subscribers[propName] === undefined) {
        subscribers[propName] = [callback];
        let proto = element;
        let prop = Object.getOwnPropertyDescriptor(proto, propName);
        while (proto && !prop) {
            proto = Object.getPrototypeOf(proto);
            prop = Object.getOwnPropertyDescriptor(proto, propName);
        }
        if (prop === undefined) {
            throw { element, propName, message: "Can't find property." };
        }
        const setter = prop.set.bind(element);
        const getter = prop.get.bind(element);
        Object.defineProperty(element, propName, {
            get() {
                return getter();
            },
            set(nv) {
                setter(nv);
                const callbacks = subscribers[propName];
                if (callbacks) {
                    callbacks.forEach(callback => callback(element, propName, nv));
                }
            },
            enumerable: true,
            configurable: true,
        });
    }
    else {
        subscribers[propName].push(callback);
    }
}
