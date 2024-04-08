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
    }
    Object.assign(dest, srcCopy);
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
