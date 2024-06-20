export class Reflector {
    #acs;
    constructor(instance, attrsToReflect) {
        const { propagator } = instance;
        this.#acs = [];
        const attrs = instance.constructor.attrs;
        const parsedAttrsToReflect = attrsToReflect.split(' ');
        for (const attr in attrs) {
            if (!parsedAttrsToReflect.includes(attr))
                continue;
            const ac = new AbortController();
            this.#acs.push(ac);
            const propInfo = attrs[attr];
            const { propName } = propInfo;
            propagator.addEventListener(propName, e => {
                console.log({ e });
                this.reflect(instance, attr, propName, propInfo);
            }, { signal: ac.signal });
            this.reflect(instance, attr, propName, propInfo);
        }
        propagator.addEventListener('disconnectedCallback', e => {
            this.#disconnect();
        });
    }
    #disconnect() {
        for (const ac of this.#acs) {
            ac.abort();
        }
    }
    reflect(instance, attr, propName, propInfo) {
        console.log({ attr, propInfo });
        instance.ignoreAttrChanges = true;
        instance.setAttribute(attr, instance[propName].toString());
        instance.ignoreAttrChanges = false;
    }
}
