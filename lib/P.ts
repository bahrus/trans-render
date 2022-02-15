import {PMDo, RenderContext, PSettings} from './types.d.js';
import {interpolate, getVal} from './SplitText.js';
import {applyP} from './applyP.js';
export class P implements PMDo{
    async do(ctx: RenderContext){
        const modifiedRHS = await modifyPRHS(ctx, 0);
        applyP(ctx.target!, [modifiedRHS] as PSettings);
    }
}

export async function modifyPRHS(ctx: RenderContext, idx: number){
    const rhs = ctx.rhs![idx];
    if(rhs === undefined) return;
    const modifiedRHS: any = {};
    for(const key in rhs){
        let val = await modifyVal(key, rhs, ctx);
        modifiedRHS[key] = val;
    }
    const newRHS = [...ctx.rhs];
    newRHS[idx] = modifiedRHS;
    ctx.rhs = newRHS;
    return modifiedRHS;
}

export async function modifyVal(key: string, rhs: any, ctx: RenderContext){
    let path = rhs[key];
    const host = ctx.host! as any;
    if(host === undefined) return path;
    switch(typeof path){
        case 'string':
            return getVal(host, path);
        case 'object':
            if(Array.isArray(path)){
                return interpolate(path, host);
            }else{
                return path; //Not implemented
            }
        default:
            return path;
    }
}