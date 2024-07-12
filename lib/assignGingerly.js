export function assignGingerly(dest, src, allowedProps) {
    if (!src || typeof src !== 'object')
        return;
    const chainOps = {};
    const srcCopy = { ...src };
    let doChains = false;
    for (const srcKey in src) {
        if (srcKey.startsWith('?.')) {
            doChains = true;
            chainOps[srcKey] = src[srcKey];
            delete srcCopy[srcKey];
        }
        else {
            if (allowedProps !== undefined && !(srcKey in allowedProps))
                throw 401;
        }
        //if target prop exists and isn't an instance of a class,  but the src prop is of type EventType
        //merge what is there first...
        //if target prop is of type EventType and src prop isn't an instance of a class, merge it in.
        const destProp = dest[srcKey];
        const srcProp = srcCopy[srcKey];
        if (destProp instanceof Object && destProp.constructor === Object && srcProp instanceof EventTarget) {
            assignGingerly(srcProp, destProp);
        }
        else if (destProp instanceof EventTarget && srcProp instanceof Object && srcProp.constructor === Object) {
            assignGingerly(destProp, srcProp);
            continue;
        }
        dest[srcKey] = srcProp;
    }
    //Object.assign(dest, srcCopy);
    applyChains(dest, chainOps);
}
async function applyChains(dest, chainOps) {
    const { setProp } = await import('./setProp.js');
    for (const chainOpsKey in chainOps) {
        const key = chainOpsKey.replaceAll('?.', '.');
        const val = chainOps[chainOpsKey];
        setProp(dest, key, val);
    }
}
