export function none(expr, src) {
    for (const subExpr of expr) {
        if (src[subExpr])
            return false;
    }
    return true;
}
