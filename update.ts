import {RenderContext, RenderOptions} from './types_old.js';
import {UpdateContext} from './types_old.js';
import {process} from './init.js';


export function update(ctx: RenderContext, target: HTMLElement | DocumentFragment, options?: RenderOptions){
    const updateCtx = ctx as UpdateContext;
    updateCtx.update = update;
    const firstChild = target.firstElementChild;
    if(firstChild !== null){
        ctx.leaf = firstChild as HTMLElement;
        process(ctx, 0, 0, options);
        if(options){
            const updatedCallback = options.updatedCallback;
            if(updatedCallback !== undefined) updatedCallback(ctx, target, options);
        }
    }
    return updateCtx;
}