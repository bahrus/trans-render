import { applyP } from './applyP.js';
export class P {
    do(ctx) {
        const modifiedRHS = modifyRHS(ctx, 0);
        applyP(ctx.target, [modifiedRHS]);
    }
}
export function modifyRHS(ctx, idx) {
    const rhs = ctx.rhs[idx];
    if (rhs === undefined)
        return;
    const modifiedRHS = {};
    for (const key in rhs) {
        let val = evalRHS(key, rhs);
        if (typeof val === 'function') {
            modifiedRHS[key] = val(ctx);
        }
        else {
            modifiedRHS[key] = val;
        }
    }
    ctx.rhs[idx] = modifiedRHS;
    return modifiedRHS;
}
function evalRHS(key, rhs) {
    let val = rhs[key];
    if (typeof val === 'string') {
        if (val.startsWith('${') && val.endsWith('}')) {
            val = val.substring(2, val.length - 1);
            const fn = eval('({ctx, host, target, idx, mode, targetProp, options, val, rhs  }) => ' + val);
            val = fn;
            rhs[key] = fn;
        }
    }
    return val;
}
