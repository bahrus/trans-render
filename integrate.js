import { init } from './init.js';
export function integrate(template, target, ctx, transform) {
    if (ctx.update !== undefined) {
        ctx.matchFirstChild = true;
    }
    else {
        init(template, {
            transform: transform
        }, target);
    }
}
//# sourceMappingURL=integrate.js.map