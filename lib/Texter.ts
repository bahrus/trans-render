import {PSDo, RenderContext} from './types.js';

export class Texter implements PSDo{
    do(ctx: RenderContext){
        ctx.target!.textContent = ctx.rhs;
    }
}