export function getArrayVal(transformer, uow, u) {
    if (u.length === 1 && typeof u[0] === 'number')
        return u[0];
    const mapped = u.map(x => {
        switch (typeof x) {
            case 'number':
                return transformer.getNumberUVal(uow, x);
            case 'string':
                return x;
            default:
                throw 'NI';
        }
    });
    return mapped.join('');
}
