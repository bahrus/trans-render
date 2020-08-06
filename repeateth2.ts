import {
    TransformValueOptions, 
    RenderContext, 
    InitTransform, 
    UpdateTransform,
    ToTOrFnToTot
} from './types.js';
import {repeatInit}from './repeatInit2.js';
import {repeatethUpdateth} from './repeatethUpdateth2.js';
const initialized = Symbol();
export function repeateth(
    template: ToTOrFnToTot, 
    ctx: RenderContext, 
    items: any[], 
    target: HTMLElement, 
    initTransform: InitTransform,
    updateTransform: UpdateTransform = initTransform
    ){
    if((<any>target)[initialized as any as string] !== undefined){
        repeatethUpdateth(template, ctx, items, target, updateTransform)
    }else{
        repeatInit(template, ctx, items, target, initTransform);
        (<any>target)[initialized as any as string] = true;
    }
}