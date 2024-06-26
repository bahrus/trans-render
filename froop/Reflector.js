export class Reflector {
    #acs = [];
    constructor(instance, attrsToReflect) {
        const { propagator } = instance;
        const attrs = instance.constructor.attrs;
        const reflectAll = attrsToReflect === '*';
        let parsedAttrsToReflect;
        if (!reflectAll) {
            parsedAttrsToReflect = attrsToReflect.split(',').map(s => s.trim());
        }
        for (const attr in attrs) {
            if (!reflectAll && !parsedAttrsToReflect.includes(attr))
                continue;
            const ac = new AbortController();
            this.#acs.push(ac);
            const propInfo = attrs[attr];
            const { propName } = propInfo;
            propagator.addEventListener(propName, e => {
                this.#reflect(instance, attr, propName, propInfo);
            }, { signal: ac.signal });
            this.#reflect(instance, attr, propName, propInfo);
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
    #reflect(instance, attr, propName, propInfo) {
        const val = instance[propName];
        if (val === undefined)
            return;
        instance.ignoreAttrChanges = true;
        if (val === null || val === false) {
            instance.removeAttribute(attr);
        }
        else {
            instance.setAttribute(attr, val.toString());
        }
        instance.ignoreAttrChanges = false;
    }
}
