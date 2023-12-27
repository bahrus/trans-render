import {PMDo, RenderContext, PSettings} from './types.d.js';
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

export async function modifyVal(key: string, rhs: any, ctx: RenderContext): Promise<string>{
    let path = rhs[key];
    let {host} = ctx;
    if(host === undefined) return path;
    switch(typeof path){
        case 'string':
            const {getVal} = await import ('./getVal.js');
            return await getVal(ctx, path);
        case 'object':
            if(Array.isArray(path)){
                const {weave} = await import ('./weave.js');
                return await weave(path, host);
            }else{
                return path; //Not implemented
            }
        default:
            return path;
    }
}