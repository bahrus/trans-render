import { transform } from './transform.js';
export class NestedTransform {
    do(ctx) {
        const newCtx = Object.assign({}, ctx);
        newCtx.match = ctx.rhs.match;
        ctx.target.textContent = ctx.rhs;
        transform(ctx.target, ctx);
    }
}
