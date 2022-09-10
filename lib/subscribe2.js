export async function subscribe(target, propName, propagator) {
    if (target instanceof Element) {
        const { isDefined } = await import('./isDefined.js');
        await isDefined(target);
    }
    let proto = target;
    let prop = Object.getOwnPropertyDescriptor(proto, propName);
    while (proto && !prop) {
        proto = Object.getPrototypeOf(proto);
        prop = Object.getOwnPropertyDescriptor(proto, propName);
    }
    if (prop === undefined) {
        throw { target, propName, message: "Can't find property." };
    }
    const setter = prop.set.bind(target);
    const getter = prop.get.bind(target);
    Object.defineProperty(target, propName, {
        get() {
            return getter();
        },
        set(nv) {
            setter(nv);
            propagator.dispatchEvent(new Event(propName));
        },
        enumerable: true,
        configurable: true,
    });
}
