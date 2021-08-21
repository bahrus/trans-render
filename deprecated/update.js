import { process } from './init.js';
export function update(ctx, target, options) {
    const updateCtx = ctx;
    updateCtx.update = update;
    const firstChild = target.firstElementChild;
    if (firstChild !== null) {
        ctx.leaf = firstChild;
        process(ctx, 0, 0, options);
        if (options) {
            const updatedCallback = options.updatedCallback;
            if (updatedCallback !== undefined)
                updatedCallback(ctx, target, options);
        }
    }
    return updateCtx;
}
