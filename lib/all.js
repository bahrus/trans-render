export function all(expr, src) {
    for (const subExpr of expr) {
        if (!src[subExpr])
            return false;
    }
    return true;
}
