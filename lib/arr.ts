//deprecated - use mount-observer/refid/arr.js
export function arr<T = any>(inp: T | T[] | undefined) : T[] {
    return inp === undefined ? []
        : Array.isArray(inp) ? inp : [inp];
}