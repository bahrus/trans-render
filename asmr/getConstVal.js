export function getConstVal(specifier) {
    const { constVal, as } = specifier;
    switch (as) {
        case 'number':
        case 'boolean':
        case 'boolean|number':
            return JSON.parse(constVal);
        case 'string':
            return constVal;
        default:
            throw 'NI';
    }
}
