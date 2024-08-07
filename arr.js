export function arr(inp) {
    return inp === undefined ? undefined
        : Array.isArray(inp) ? inp : [inp];
}
export function arr0(inp) {
    return arr(inp) || [];
}
