import { init } from './init.js';
export function CloneAndTransformInit(src, ctx, target, options) {
    const clonedElement = src.cloneNode(true);
    init(clonedElement, ctx, target, options);
}
