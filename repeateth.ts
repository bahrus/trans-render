import {TransformValueOptions, RenderContext} from './types.js';
import {repeatInit}from './repeatInit.js';
import {repeatethUpdateth} from './repeatethUpdateth.js';
export function repeateth(
    template: HTMLTemplateElement, 
    ctx: RenderContext, 
    countOrItems: number | any[], 
    target: HTMLElement, 
    initTransform: TransformValueOptions,
    updateTransform: TransformValueOptions = initTransform
    ){
    if(ctx.update !== undefined){
        return repeatethUpdateth(template, ctx, countOrItems, target, updateTransform)
    }else{
        return repeatInit(template, ctx, countOrItems, target, initTransform);
    }
}