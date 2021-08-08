import { modifyRHS } from './P.js';
import { applyPE } from './applyPE.js';
export class PE {
    do(ctx) {
        if (ctx.host === undefined)
            throw 'Unknown host.';
        const modifiedRHS = modifyRHS(ctx);
        applyPE(ctx.host, ctx.target, modifiedRHS);
    }
}
