import { applyPE } from './applyPE.js';
export class PE {
    do(ctx) {
        if (ctx.host === undefined)
            throw 'Unknown host.';
        applyPE(ctx.host, ctx.target, ctx.rhs);
    }
}
