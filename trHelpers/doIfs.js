export async function doIfs(transformer, matchingElement, uow, i) {
    let transpiledIf;
    switch (typeof i) {
        case 'string':
            transpiledIf = {
                d: 0,
                ifEqual: [0, i]
            };
            break;
        case 'object':
            if (Array.isArray(i))
                throw 'NI';
            transpiledIf = i;
            break;
        default: throw 'NI';
    }
    const { ifAllOf, ifEqual, ifNoneOf, d } = transpiledIf;
    if (d !== undefined) {
        const derivedVal = await transformer.getDerivedVal(uow, d, matchingElement);
        if (!derivedVal)
            return false;
    }
    if (ifAllOf !== undefined) {
        for (const n of ifAllOf) {
            if (!transformer.getNumberUVal(uow, n))
                return false;
        }
    }
    if (ifNoneOf !== undefined) {
        for (const n of ifNoneOf) {
            if (transformer.getNumberUVal(uow, n))
                return false;
        }
    }
    if (ifEqual !== undefined) {
        const [lhsN, rhsNorS] = ifEqual;
        const lhs = transformer.getNumberUVal(uow, lhsN);
        let rhs;
        switch (typeof rhsNorS) {
            case 'number':
                rhs = transformer.getNumberUVal(uow, rhsNorS);
                break;
            case 'object':
                if (Array.isArray(rhsNorS)) {
                    [rhs] = rhsNorS;
                }
                else {
                    throw 'NI';
                }
                break;
            case 'string':
                rhs = rhsNorS;
                break;
        }
        if (lhs !== rhs)
            return false;
    }
    return true;
}
