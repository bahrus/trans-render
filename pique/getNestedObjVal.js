const dependencyLookup = new Map();
export async function getNestedObjVal(transformer, piqueProcessor, u, propName) {
    let dependencyTracker;
    if (!dependencyLookup.has(u)) {
        console.log('new u');
        dependencyTracker = new Map();
        dependencyLookup.set(u, dependencyTracker);
    }
    else {
        const dep = dependencyLookup.get(u);
        console.log({ dep, propName });
    }
    const returnObj = {};
    for (const key in u) {
        const v = u[key];
        let vSet;
        if (dependencyTracker !== undefined) {
            vSet = new Set();
            dependencyTracker.set(key, vSet);
        }
        switch (typeof v) {
            case 'number': {
                const val = transformer.getNumberUVal(piqueProcessor, v, vSet);
                returnObj[key] = val;
                break;
            }
            case 'function': {
                throw 'NI';
            }
            case 'object': {
                if (Array.isArray(v)) {
                    const val = transformer.getArrayVal(piqueProcessor, v);
                    returnObj[key] = val;
                }
                else {
                    const val = transformer.getNestedObjVal(piqueProcessor, v);
                    returnObj[key] = val;
                }
            }
            case 'boolean':
            case 'string': {
                returnObj[key] = v;
                break;
            }
        }
    }
    return returnObj;
}
