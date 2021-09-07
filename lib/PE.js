import { modifyPRHS } from './P.js';
import { applyPE } from './applyPE.js';
export class PE {
    do(ctx) {
        if (ctx.host === undefined)
            throw 'Unknown host.';
        const prevRHS = Object.assign({}, ctx.rhs);
        const modifiedProps = modifyPRHS(ctx, 0);
        const modifiedEvents = modifyERHS(ctx, 1);
        applyPE(ctx.host, ctx.target, [modifiedProps, modifiedEvents]);
        ctx.rhs = prevRHS;
    }
}
export function modifyERHS(ctx, idx) {
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
    let val = rhs[key];
    const host = ctx.host;
    if (host === undefined)
        return val;
    switch (typeof val) {
        case 'string':
            return gFn(host, val);
        case 'object':
            if (Array.isArray(val)) {
                const newVal = [];
                let idx = 0;
                for (const part of val) {
                    let newPart = part;
                    switch (idx) {
                        case 0:
                        case 2:
                            newPart = gFn(host, part);
                            break;
                    }
                    newVal.push(newPart);
                    idx++;
                }
                return newVal;
            }
            else {
                throw "NI"; //Not implemented
            }
    }
    return val;
}
function gFn(host, val) {
    return host[val] || self[val] || val;
}
