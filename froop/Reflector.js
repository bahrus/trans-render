export class Reflector {
    constructor(instance, attrsToReflect) {
        const { propagator } = instance;
        const attrs = instance.constructor.attrs;
        const parsedAttrsToReflect = attrsToReflect.split(' ');
        for (const attr in attrs) {
            if (!parsedAttrsToReflect.includes(attr))
                continue;
            const propInfo = attrs[attr];
            const { propName } = propInfo;
            propagator.addEventListener(propName, e => {
                console.log({ e });
                this.reflect(instance, attr, propName, propInfo);
            });
            this.reflect(instance, attr, propName, propInfo);
        }
    }
    reflect(instance, attr, propName, propInfo) {
        console.log({ attr, propInfo });
        instance.ignoreAttrChanges = true;
        instance.setAttribute(attr, instance[propName].toString());
        instance.ignoreAttrChanges = false;
    }
}
