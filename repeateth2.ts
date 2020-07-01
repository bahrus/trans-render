import {
    TransformValueOptions, 
    RenderContext, 
    InitTransform, 
    UpdateTransform
} from './types2.js';
import {repeatInit}from './repeatInit2.js';
import {repeatethUpdateth} from './repeatethUpdateth2.js';
export function repeateth(
    template: HTMLTemplateElement, 
    ctx: RenderContext, 
    items: any[], 
    target: HTMLElement, 
    initTransform: InitTransform,
    updateTransform: UpdateTransform = initTransform
    ){
    if(ctx.mode === 'update'){
        repeatethUpdateth(template, ctx, items, target, updateTransform)
    }else{
        repeatInit(template, ctx, items, target, initTransform);
    }
}