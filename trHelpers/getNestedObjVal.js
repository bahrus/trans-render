export async function getNestedObjVal(transformer, uow, u) {
    const returnObj = {};
    for (const key in u) {
        const v = u[key];
        switch (typeof v) {
            case 'number': {
                const val = transformer.getNumberUVal(uow, v);
                returnObj[key] = val;
                break;
            }
            case 'function': {
                throw 'NI';
            }
            case 'object': {
                if (Array.isArray(v)) {
                    const val = transformer.getArrayVal(uow, v);
                    returnObj[key] = val;
                }
                else {
                    const val = transformer.getNestedObjVal(uow, v);
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
