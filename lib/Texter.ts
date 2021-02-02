import {PMDo, RenderContext} from './types.js';

export class Texter implements PMDo{
    do(ctx: RenderContext){
        ctx.target!.textContent = ctx.rhs;
    }
}