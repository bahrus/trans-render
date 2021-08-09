import { modifyPRHS } from './P.js';
import { applyPEA } from './applyPEA.js';
export class PEA {
    do(ctx) {
        if (ctx.host === undefined)
            throw 'Unknown host.';
        const modifiedProps = modifyPRHS(ctx, 0);
        const modifiedEvents = modifyPRHS(ctx, 1);
        const modifiedAttribs = modifyPRHS(ctx, 2);
        applyPEA(ctx.host, ctx.target, [modifiedProps, modifiedEvents, modifiedAttribs]);
    }
}
