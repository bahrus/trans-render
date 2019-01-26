import { process } from './init.js';
export function update(ctx, target, options) {
    const updateCtx = ctx;
    updateCtx.update = update;
    const firstChild = target.firstElementChild;
    if (firstChild !== null) {
        ctx.leaf = firstChild;
        process(ctx, 0, 0, options);
    }
    return updateCtx;
}