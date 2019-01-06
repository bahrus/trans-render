import { process } from './trans-render-init.js';
export function update(ctx, target) {
    const updateCtx = ctx;
    updateCtx.update = update;
    const firstChild = target.firstElementChild;
    if (firstChild !== null) {
        ctx.leaf = firstChild;
        process(ctx);
    }
    return updateCtx;
}
//# sourceMappingURL=trans-render-update.js.map