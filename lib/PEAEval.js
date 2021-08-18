import { modifyRHS } from './PEval.js';
import { applyPEA } from './applyPEA.js';
export class PEA {
    do(ctx) {
        if (ctx.host === undefined)
            throw 'Unknown host.';
        const modifiedProps = modifyRHS(ctx, 0);
        const modifiedEvents = modifyRHS(ctx, 1);
        const modifiedAttribs = modifyRHS(ctx, 2);
        applyPEA(ctx.host, ctx.target, [modifiedProps, modifiedEvents, modifiedAttribs]);
    }
}
