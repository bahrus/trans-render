import { modifyRHS } from './P.js';
import { applyPE } from './applyPE.js';
export class PE {
    do(ctx) {
        if (ctx.host === undefined)
            throw 'Unknown host.';
        const modifiedProps = modifyRHS(ctx, 0);
        const modifiedEvents = modifyRHS(ctx, 1);
        applyPE(ctx.host, ctx.target, [modifiedProps, modifiedEvents]);
    }
}
