import { repeatInit } from './repeatInit2.js';
import { repeatethUpdateth } from './repeatethUpdateth2.js';
export function repeateth(template, ctx, items, target, initTransform, updateTransform = initTransform) {
    if (ctx.mode === 'update') {
        repeatethUpdateth(template, ctx, items, target, updateTransform);
    }
    else {
        repeatInit(template, ctx, items, target, initTransform);
    }
}
