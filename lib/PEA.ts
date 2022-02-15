import {PMDo, RenderContext, PEUnionSettings, PEAUnionSettings} from './types.d.js';
import {modifyPRHS} from './P.js';
import {modifyERHS} from './PE.js';
import {applyPEA} from './applyPEA.js';

export class PEA implements PMDo{
    async do(ctx: RenderContext){
        if(ctx.host=== undefined) throw 'Unknown host.';
        const modifiedProps = modifyPRHS(ctx, 0);
        const modifiedEvents = modifyERHS(ctx, 1);
        const modifiedAttribs = modifyPRHS(ctx, 2);
        applyPEA(ctx.host, ctx.target as HTMLElement, [modifiedProps, modifiedEvents, modifiedAttribs] as PEAUnionSettings);
    }
}