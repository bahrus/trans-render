import { applyP } from './applyP.js';
export class P {
    do(ctx) {
        const rhs = ctx.rhs;
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
        applyP(ctx.target, modifiedRHS);
    }
}
export function evalRHS(key, rhs) {
    let val = rhs[key];
    if (typeof val === 'string') {
        if (val.startsWith('${') && val.endsWith('}')) {
            val = val.substr(2, val.length - 1);
            const fn = eval('({ctx, host, target, idx, mode, targetProp, options, val, rhs  }) => ' + val);
            val = fn;
            rhs[key] = fn;
        }
    }
    return val;
}
