const ctlRe = /(?=[A-Z])/;
export function camelToLisp(s) {
    return s.split(ctlRe).join('-').toLowerCase();
}
