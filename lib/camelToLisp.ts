const ctlRe = /[\w]([A-Z])/g;
export function camelToLisp(s: string) {
    return s.replace(ctlRe, function(m) {
        return m[0] + "-" + m[1];
    }).toLowerCase();
}