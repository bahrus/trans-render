export async function pq(expr, src) {
    const { ifAllOf, ifNoneOf, ifEquals, ifAtLeastOneOf } = expr;
    if (ifAllOf !== undefined) {
        const { all } = await import('./all.js');
        if (!await all(ifAllOf, src))
            return false;
    }
    if (ifNoneOf !== undefined) {
        const { none } = await import('./none.js');
        if (!await none(ifNoneOf, src))
            return false;
    }
    if (ifEquals !== undefined) {
        const { eq } = await import('./eq.js');
        if (!await eq(ifEquals, src))
            return false;
    }
    if (ifAtLeastOneOf !== undefined) {
        const { oneOf } = await import('./oneOf.js');
        if (!await oneOf(ifAtLeastOneOf, src))
            return false;
    }
    return true;
}
