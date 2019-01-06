import {IInitContext,IBaseContext, process} from './trans-render-init.js';

export interface IUpdateContext extends IInitContext {
    update: (ctx: IInitContext, target: HTMLElement) => IUpdateContext;
}

export function update(ctx: IInitContext, target: HTMLElement){
    const updateCtx = ctx as IUpdateContext;
    updateCtx.update = update;
    const firstChild = target.firstElementChild;
    if(firstChild !== null){
        ctx.leaf = firstChild;
        process(ctx);
    }
    return updateCtx;
}