export type lhs = string;
export type rhs = string | undefined;
export function splitOnce(s: string, divider: string): [lhs, rhs]{
    const iPosOfDividor = s.indexOf(divider);
    if(iPosOfDividor === -1) return [s, undefined];
    return [s.substring(0, iPosOfDividor), s.substring(iPosOfDividor + divider.length)]
}