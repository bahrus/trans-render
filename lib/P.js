import { interpolate, getVal } from './SplitText.js';
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
    const newRHS = [...ctx.rhs];
    newRHS[idx] = modifiedRHS;
    ctx.rhs = newRHS;
    return modifiedRHS;
}
export function modifyVal(key, rhs, ctx) {
    let path = rhs[key];
    const host = ctx.host;
    if (host === undefined)
        return path;
    switch (typeof path) {
        case 'string':
            return getVal(host, path);
        case 'object':
            if (Array.isArray(path)) {
                return interpolate(path, host);
            }
            else {
                throw "NI"; //Not implemented
            }
        default:
            return path;
    }
}
