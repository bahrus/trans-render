import { repeatInit } from './repeatInit2.js';
import { repeatethUpdateth } from './repeatethUpdateth2.js';
export async function repeateth(template, ctx, items, target, initTransform, updateTransform = initTransform) {
    if (ctx.mode === 'update') {
        return await repeatethUpdateth(template, ctx, items, target, updateTransform);
    }
    else {
        return await repeatInit(template, ctx, items, target, initTransform);
    }
}
