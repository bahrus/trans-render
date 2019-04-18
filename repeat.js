import { repeatInit } from './repeatInit.js';
import { repeatUpdate } from './repeatUpdate.js';
export function repeat(template, ctx, count, target, targetTransform) {
    if (ctx.update !== undefined) {
        return repeatUpdate(template, ctx, count, target, targetTransform);
    }
    else {
        return repeatInit(template, ctx, count, target, targetTransform);
    }
}
