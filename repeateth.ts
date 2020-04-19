import {TransformValueOptions, RenderContext} from './init.d.js';
import {repeatInit}from './repeatInit.js';
import {repeatethUpdateth} from './repeatethUpdateth.js';
export function repeateth(template: HTMLTemplateElement, ctx: RenderContext, countOrItems: number | any[], target: HTMLElement, targetTransform?: TransformValueOptions){
    if(ctx.update !== undefined){
        return repeatethUpdateth(template, ctx, countOrItems, target, targetTransform)
    }else{
        return repeatInit(template, ctx, countOrItems, target, targetTransform);
    }
}