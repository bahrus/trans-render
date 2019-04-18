import {RenderContext, RenderOptions} from './init.d.js';
import {UpdateContext} from './update.d.js';
import {process} from './init.js';


export function update(ctx: RenderContext, target: Element | DocumentFragment, options?: RenderOptions){
    const updateCtx = ctx as UpdateContext;
    updateCtx.update = update;
    const firstChild = target.firstElementChild;
    if(firstChild !== null){
        ctx.leaf = firstChild;
        process(ctx, 0, 0, options);
        if(options){
            const updatedCallback = options.updatedCallback;
            if(updatedCallback !== undefined) updatedCallback(ctx, target, options);
        }
    }
    return updateCtx;
}