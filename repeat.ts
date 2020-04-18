import {TransformValueOptions, RenderContext} from './init.d.js';
import {repeatInit} from './repeatInit.js';
import {createTemplate} from './createTemplate.js';
import {repeatUpdate} from './repeatUpdate.js';
export function repeat(template: HTMLTemplateElement | [symbol, string], ctx: RenderContext, count: number, target: HTMLElement, targetTransform?: TransformValueOptions){
    if(Array.isArray(template)) template = createTemplate(template[1], ctx, template[0]);
    if(ctx.update !== undefined){
        return repeatUpdate(template as HTMLTemplateElement, ctx, count, target, targetTransform)
    }else{
        return repeatInit(template as HTMLTemplateElement, ctx, count, target, targetTransform);
    }
}