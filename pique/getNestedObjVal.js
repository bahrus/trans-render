export async function getNestedObjVal(transformer, piqueProcessor, u) {
    const returnObj = {};
    for (const key in u) {
        const v = u[key];
        switch (typeof v) {
            case 'number': {
                const val = transformer.getNumberUVal(piqueProcessor, v);
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
