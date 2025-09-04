//deprecated - use mount-observer/refid/arr.js
export function arr(inp) {
    return inp === undefined ? []
        : Array.isArray(inp) ? inp : [inp];
}
