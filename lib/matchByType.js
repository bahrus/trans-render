export function matchByType(val, typOfProcessor, typeOfHeadProcessor) {
    if (typOfProcessor === undefined)
        return 0;
    switch (typeof val) {
        case 'object':
            if (typOfProcessor === Array && Array.isArray(val) && val.length > 0 && typeOfHeadProcessor !== undefined) {
                return matchByType(val[0], typeOfHeadProcessor, undefined);
            }
            return val instanceof typOfProcessor ? 1 : -1;
        case 'string':
            return typOfProcessor === String ? 1 : -1;
        case 'number':
            return typOfProcessor === Number ? 1 : -1;
        case 'boolean':
            return typOfProcessor === Boolean ? 1 : -1;
        case 'symbol':
            return typOfProcessor === Symbol ? 1 : -1;
        case 'bigint':
            return typOfProcessor === BigInt ? 1 : -1;
    }
    return 0;
}
function matchType(valType, typ) {
}
