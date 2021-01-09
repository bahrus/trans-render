import {PSDo, RenderContext, PSettings} from './types.d.js';
import {applyP} from './applyP.js';
export class P implements PSDo{
    do(ctx: RenderContext){
        applyP(ctx.target!, ctx.rhs as PSettings)
    }
}