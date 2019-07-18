import { repeatInit } from './repeatInit.js';
import { repeatethUpdateth } from './repeatethUpdateth.js';
export function repeateth(template, ctx, count, target, targetTransform) {
    if (ctx.update !== undefined) {
        return repeatethUpdateth(template, ctx, count, target, targetTransform);
    }
    else {
        return repeatInit(template, ctx, count, target, targetTransform);
    }
}
