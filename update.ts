import {InitContext,BaseContext, process} from './init.js';

export interface UpdateContext extends InitContext {
    update: (ctx: InitContext, target: HTMLElement) => UpdateContext;
}

export function update(ctx: InitContext, target: HTMLElement){
    const updateCtx = ctx as UpdateContext;
    updateCtx.update = update;
    const firstChild = target.firstElementChild;
    if(firstChild !== null){
        ctx.leaf = firstChild;
        process(ctx, 0, 0);
    }
    return updateCtx;
}