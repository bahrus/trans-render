import {TransformValueOptions, RenderContext} from './init.d.js';
import {repeatInit}from './repeatInit.js';
import {repeatUpdate} from './repeatUpdate.js';
export function repeat(template: HTMLTemplateElement, ctx: RenderContext, count: number, target: Element, targetTransform?: TransformValueOptions){
    if(ctx.update !== undefined){
        return repeatUpdate(template, ctx, count, target, targetTransform)
    }else{
        return repeatInit(template, ctx, count, target, targetTransform);
    }
}