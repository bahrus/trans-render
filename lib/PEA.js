import { modifyPRHS } from './P.js';
import { modifyERHS } from './PE.js';
import { applyPEA } from './applyPEA.js';
export class PEA {
    async do(ctx) {
        if (ctx.host === undefined)
            throw 'Unknown host.';
        const modifiedProps = await modifyPRHS(ctx, 0);
        const modifiedEvents = await modifyERHS(ctx, 1);
        const modifiedAttribs = await modifyPRHS(ctx, 2);
        await applyPEA(ctx.host, ctx.target, [modifiedProps, modifiedEvents, modifiedAttribs]);
    }
}
