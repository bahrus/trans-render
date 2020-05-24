import { repeatInit } from './repeatInit.js';
import { createTemplate } from './createTemplate.js';
import { repeatUpdate } from './repeatUpdate.js';
export function repeat(template, ctx, countOrItems, target, initTransform, updateTransform = initTransform) {
    if (Array.isArray(template))
        template = createTemplate(template[1], ctx, template[0]);
    if (ctx.update !== undefined) {
        return repeatUpdate(template, ctx, countOrItems, target, updateTransform);
    }
    else {
        return repeatInit(template, ctx, countOrItems, target, initTransform);
    }
}
