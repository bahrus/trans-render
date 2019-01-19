import {RenderContext} from './init.d.js';
import {process} from './init.js';

export interface UpdateContext extends RenderContext {
    update: (ctx: RenderContext, target: HTMLElement) => UpdateContext;
}

export function update(ctx: RenderContext, target: HTMLElement){
    const updateCtx = ctx as UpdateContext;
    updateCtx.update = update;
    const firstChild = target.firstElementChild;
    if(firstChild !== null){
        ctx.leaf = firstChild;
        process(ctx, 0, 0);
    }
    return updateCtx;
}