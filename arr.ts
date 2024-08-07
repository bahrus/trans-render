import {ZeroOrMore} from './types';
export function arr<T = any>(inp: ZeroOrMore<T>) : T[] | undefined {
    return inp === undefined ? undefined
        : Array.isArray(inp) ? inp : [inp];
}

export function arr0<T = any>(inp: ZeroOrMore<T>) : T[] | undefined {
    return arr(inp) || [];
}