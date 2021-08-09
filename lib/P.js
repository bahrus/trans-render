import { interpolate } from './SplitText.js';
import { applyP } from './applyP.js';
export class P {
    do(ctx) {
        const modifiedRHS = modifyPRHS(ctx, 0);
        applyP(ctx.target, [modifiedRHS]);
    }
}
export function modifyPRHS(ctx, idx) {
    const rhs = ctx.rhs[idx];
    if (rhs === undefined)
        return;
    const modifiedRHS = {};
    for (const key in rhs) {
        let val = modifyVal(key, rhs, ctx);
        modifiedRHS[key] = val;
    }
    ctx.rhs[idx] = modifiedRHS;
    return modifiedRHS;
}
export function modifyVal(key, rhs, ctx) {
    let val = rhs[key];
    const host = ctx.host;
    if (host === undefined)
        return val;
    switch (typeof val) {
        case 'string':
            return val;
        case 'object':
            if (Array.isArray(val)) {
                const innerVal = val[0];
                if (typeof innerVal !== 'string') {
                    return val;
                }
                if (val.length === 1) {
                    return host[innerVal];
                }
                else {
                    return interpolate(val, host);
                }
            }
            else {
                throw "NI"; //Not implemented
            }
    }
}
