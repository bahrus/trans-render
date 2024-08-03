import { EventHandler } from '../EventHandler.js';
class AttrReflector extends EventHandler {
    instance;
    attr;
    propName;
    propInfo;
    handleEvent() {
        const { instance, propName, attr } = this;
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
export class Reflector {
    instance;
    attrsToReflect;
    #acs = [];
    constructor(instance, attrsToReflect) {
        this.instance = instance;
        this.attrsToReflect = attrsToReflect;
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
            const attrReflector = new AttrReflector(this);
            Object.assign(attrReflector, { instance, attr, propName, propInfo });
            attrReflector.sub(propagator, propName, { signal: ac.signal });
            attrReflector.handleEvent();
        }
        //I'm thinking this event handler doesn't access any shared memory
        // so no need to use EventHandler
        propagator.addEventListener('disconnectedCallback', e => {
            this.#disconnect();
        }, { once: true });
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
