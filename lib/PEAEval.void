import {PMDo, RenderContext, PEUnionSettings, PEAUnionSettings} from './types.d.js';
import {modifyRHS} from './PEval.js';
import {applyPEA} from './applyPEA.js';

export class PEA implements PMDo{
    do(ctx: RenderContext){
        if(ctx.host=== undefined) throw 'Unknown host.';
        const modifiedProps = modifyRHS(ctx, 0);
        const modifiedEvents = modifyRHS(ctx, 1);
        const modifiedAttribs = modifyRHS(ctx, 2);
        applyPEA(ctx.host, ctx.target as HTMLElement, [modifiedProps, modifiedEvents, modifiedAttribs] as PEAUnionSettings);
    }
}