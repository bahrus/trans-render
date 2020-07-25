import { repeatInit } from './repeatInit2.js';
import { repeatethUpdateth } from './repeatethUpdateth2.js';
const initialized = Symbol();
export function repeateth(template, ctx, items, target, initTransform, updateTransform = initTransform) {
    if (target[initialized] !== undefined) {
        repeatethUpdateth(template, ctx, items, target, updateTransform);
    }
    else {
        repeatInit(template, ctx, items, target, initTransform);
        target[initialized] = true;
    }
}
