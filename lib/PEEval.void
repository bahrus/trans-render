import {PMDo, RenderContext, PEUnionSettings} from './types.js';
import {modifyRHS} from './PEval.js';
import {applyPE} from './applyPE.js';

export class PEEval implements PMDo{
    do(ctx: RenderContext){
        if(ctx.host=== undefined) throw 'Unknown host.';
        const modifiedProps = modifyRHS(ctx, 0);
        const modifiedEvents = modifyRHS(ctx, 1);
        applyPE(ctx.host, ctx.target as HTMLElement, [modifiedProps, modifiedEvents] as PEUnionSettings);
    }
}