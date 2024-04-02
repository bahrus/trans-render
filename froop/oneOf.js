export function oneOf(expr, src) {
    for (const subExpr of expr) {
        if (src[subExpr])
            return true;
    }
    return false;
}
