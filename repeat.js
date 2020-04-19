import { repeatInit } from './repeatInit.js';
import { createTemplate } from './createTemplate.js';
import { repeatUpdate } from './repeatUpdate.js';
export function repeat(template, ctx, countOrItems, target, targetTransform) {
    if (Array.isArray(template))
        template = createTemplate(template[1], ctx, template[0]);
    if (ctx.update !== undefined) {
        return repeatUpdate(template, ctx, countOrItems, target, targetTransform);
    }
    else {
        return repeatInit(template, ctx, countOrItems, target, targetTransform);
    }
}
