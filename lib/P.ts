import {PMDo, RenderContext, PSettings} from './types.d.js';
import {applyP} from './applyP.js';
export class P implements PMDo{
    do(ctx: RenderContext){
        applyP(ctx.target!, ctx.rhs as PSettings)
    }
}