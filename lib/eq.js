export function eq(expr, src) {
    let firstVal = undefined;
    let first = true;
    for (const subExpr of expr) {
        if (first) {
            firstVal = src[subExpr];
            first = false;
            continue;
        }
        if (src[subExpr] !== firstVal)
            return false;
    }
    return true;
}
