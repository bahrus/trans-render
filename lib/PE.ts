import {PSDo, RenderContext, PEUnionSettings} from './types.d.js';
import {applyPE} from './applyPE.js';

export class PE implements PSDo{
    do(ctx: RenderContext){
        if(ctx.host=== undefined) throw 'Unknown host.';
        applyPE(ctx.host, ctx.target as HTMLElement, ctx.rhs as PEUnionSettings);
    }
}