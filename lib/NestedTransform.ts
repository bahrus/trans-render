import {PMDo, RenderContext} from './types.js';
import {transform} from './transform.js';

export class NestedTransform implements PMDo{
    do(ctx: RenderContext){
        const newCtx: RenderContext = {...ctx};
        newCtx.match = ctx.rhs.match;
        ctx.target!.textContent = ctx.rhs;
        transform(ctx.target! as HTMLElement, ctx);
    }
}