import { repeatInit } from './repeatInit.js';
import { repeatethUpdateth } from './repeatethUpdateth.js';
export function repeateth(template, ctx, countOrItems, target, targetTransform) {
    if (ctx.update !== undefined) {
        return repeatethUpdateth(template, ctx, countOrItems, target, targetTransform);
    }
    else {
        return repeatInit(template, ctx, countOrItems, target, targetTransform);
    }
}
