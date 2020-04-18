import { repeatInit } from './repeatInit.js';
import { createTemplate } from './createTemplate.js';
import { repeatUpdate } from './repeatUpdate.js';
export function repeat(template, ctx, count, target, targetTransform) {
    if (Array.isArray(template))
        template = createTemplate(template[1], ctx, template[0]);
    if (ctx.update !== undefined) {
        return repeatUpdate(template, ctx, count, target, targetTransform);
    }
    else {
        return repeatInit(template, ctx, count, target, targetTransform);
    }
}
