import {PMDo, RenderContext, PEUnionSettings} from './types.d.js';
import {evalRHS} from './P.js';
import {applyPE} from './applyPE.js';

export class PE implements PMDo{
    do(ctx: RenderContext){
        if(ctx.host=== undefined) throw 'Unknown host.';
        const modifiedRHS: any = {};
        const rhs = ctx.rhs!;
        for(const key in rhs){
            let val = evalRHS(key, rhs);
            if(typeof val === 'function'){
                modifiedRHS[key] = val(ctx);
            }else{
                modifiedRHS[key] = val;
            }
        }
        applyPE(ctx.host, ctx.target as HTMLElement, modifiedRHS as PEUnionSettings);
    }
}