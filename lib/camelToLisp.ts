const ctlRe = /(?=[A-Z])/;
export function camelToLisp(s: string) {
    return s.split(ctlRe).join('-').toLowerCase();
}