import {PMDo, RenderContext, PEUnionSettings} from './types.d.js';
import {modifyRHS} from './P.js';
import {applyPE} from './applyPE.js';

export class PE implements PMDo{
    do(ctx: RenderContext){
        if(ctx.host=== undefined) throw 'Unknown host.';
        const modifiedRHS = modifyRHS(ctx);
        applyPE(ctx.host, ctx.target as HTMLElement, modifiedRHS as PEUnionSettings);
    }
}