export function all(expr, src, ctx) {
    for (const subExpr of expr) {
        if (!src[subExpr])
            return false;
    }
    return true;
}
