import {RenderContext, RenderOptions} from './init.d.js';
import {UpdateContext} from './update.d.js';
import {process} from './init.js';


export function update(ctx: RenderContext, target: HTMLElement | DocumentFragment, options?: RenderOptions){
    const updateCtx = ctx as UpdateContext;
    updateCtx.update = update;
    const firstChild = target.firstElementChild;
    if(firstChild !== null){
        ctx.leaf = firstChild;
        process(ctx, 0, 0, options);
    }
    return updateCtx;
}