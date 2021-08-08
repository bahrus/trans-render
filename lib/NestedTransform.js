import { transform } from './transform.js';
export class NestedTransform {
    do(ctx) {
        const newCtx = { ...ctx };
        newCtx.match = ctx.rhs;
        ctx.target.textContent = ctx.rhs;
        transform(ctx.target, ctx);
    }
}
