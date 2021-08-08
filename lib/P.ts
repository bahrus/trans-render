import {PMDo, RenderContext, PSettings} from './types.d.js';
import {applyP} from './applyP.js';
export class P implements PMDo{
    do(ctx: RenderContext){
        const modifiedRHS = modifyRHS(ctx);
        applyP(ctx.target!, modifiedRHS as PSettings);
    }
}

export function modifyRHS(ctx: RenderContext){
    const rhs = ctx.rhs!;
    const modifiedRHS: any = {};
    for(const key in rhs){
        let val = evalRHS(key, rhs);
        if(typeof val === 'function'){
            modifiedRHS[key] = val(ctx);
        }else{
            modifiedRHS[key] = val;
        }
    }
    return modifiedRHS;
}

function evalRHS(key: string, rhs: any){
    let val = rhs[key];
    if(typeof val === 'string'){
        if(val.startsWith('${') && val.endsWith('}')){
            val = val.substr(2, val.length - 1);
            const fn = eval('({ctx, host, target, idx, mode, targetProp, options, val, rhs  }) => ' + val );
            val = fn;
            rhs[key] = fn;
        }
    }
    return val;
}