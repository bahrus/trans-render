import { evalRHS } from './P.js';
import { applyPE } from './applyPE.js';
export class PE {
    do(ctx) {
        if (ctx.host === undefined)
            throw 'Unknown host.';
        const modifiedRHS = {};
        const rhs = ctx.rhs;
        for (const key in rhs) {
            let val = evalRHS(key, rhs);
            if (typeof val === 'function') {
                modifiedRHS[key] = val(ctx);
            }
            else {
                modifiedRHS[key] = val;
            }
        }
        applyPE(ctx.host, ctx.target, modifiedRHS);
    }
}
