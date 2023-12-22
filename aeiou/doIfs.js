import { arr } from '../Transform.js';
export async function doIfs(transformer, matchingElement, uow, i) {
    const iffs = arr(i);
    for (const iff of iffs) {
        const { ifAllOf, ifEqual, ifNoneOf, u } = iff;
        if (ifAllOf !== undefined) {
            for (const n of ifAllOf) {
                if (!transformer.getNumberUVal(uow, n))
                    continue;
            }
        }
        if (ifNoneOf !== undefined) {
            for (const n of ifNoneOf) {
                if (transformer.getNumberUVal(uow, n))
                    continue;
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
                continue;
        }
        await transformer.doUpdate(matchingElement, uow, u);
    }
}
