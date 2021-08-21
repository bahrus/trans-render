import { repeatInit } from './repeatInit.js';
import { repeatethUpdateth } from './repeatethUpdateth.js';
export function repeateth(template, ctx, countOrItems, target, initTransform, updateTransform = initTransform) {
    if (ctx.update !== undefined) {
        return repeatethUpdateth(template, ctx, countOrItems, target, updateTransform);
    }
    else {
        return repeatInit(template, ctx, countOrItems, target, initTransform);
    }
}
