import { modifyPRHS } from './P.js';
import { modifyERHS } from './PE.js';
import { applyPEA } from './applyPEA.js';
export class PEA {
    async do(ctx) {
        if (ctx.host === undefined)
            throw 'Unknown host.';
        const modifiedProps = modifyPRHS(ctx, 0);
        const modifiedEvents = modifyERHS(ctx, 1);
        const modifiedAttribs = modifyPRHS(ctx, 2);
        applyPEA(ctx.host, ctx.target, [modifiedProps, modifiedEvents, modifiedAttribs]);
    }
}
