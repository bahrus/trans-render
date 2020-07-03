const sk = Symbol('sk');
export function interpolate(target, prop, obj, isAttr = false) {
    let split = target[sk];
    if (split === undefined) {
        const txt = isAttr ? target.getAttribute(prop) : target[prop];
        split = txt.split('|');
        target[sk] = split.map(s => {
            const optionalChain = s.split('??'); //todo trimend only -- waiting for universal browser support
            return optionalChain.length === 1 ? optionalChain[0] : optionalChain;
        });
    }
    const newVal = target[sk].map((a, idx) => {
        const isArray = Array.isArray(a);
        const s = isArray ? a[0] : a;
        if (s[0] === '.') {
            const frstItem = obj[s.substr(1).trim()];
            if (!isArray) {
                return frstItem;
            }
            else {
                return (frstItem === undefined || frstItem === null) ? a[1] : frstItem;
            }
        }
        else {
            if (idx % 2 === 1) {
                return '|' + s + '|';
            }
            else {
                return s;
            }
        }
    }).join('');
    if (isAttr) {
        target.setAttribute(prop, newVal);
    }
    else {
        target[prop] = newVal;
    }
}
export const interpolateSym = Symbol.for('cac2869c-94ef-4d3e-8264-418103c7433c');
function fromTuple(ctx, pia) {
    interpolate(ctx.target, pia[1], pia[2], pia[3]);
}
export const plugin = {
    fn: fromTuple,
    sym: interpolateSym
};
