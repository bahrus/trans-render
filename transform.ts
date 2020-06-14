import { getChildFromSinglePath } from "./getChildFromSinglePath";

import {
    RenderContext, 
    RenderOptions, 
    NextStep, 
    TransformValueOptions, 
    TransformMatch,
    TransformValueObjectOptions,
    TransformValueArrayOptions
} from './types2.js';

import { itemLookup } from "./logansLoopInit";

export function transform(
    sourceOrTemplate: HTMLElement | DocumentFragment,
    ctx: RenderContext,
    target: HTMLElement | DocumentFragment = sourceOrTemplate,
    options?: RenderOptions
){
    const isTemplate = (sourceOrTemplate as HTMLElement).localName === "template";
    const source = isTemplate
      ? (sourceOrTemplate as HTMLTemplateElement).content.cloneNode(true) as DocumentFragment
      : sourceOrTemplate;
    if(ctx.Transform !== undefined){
        processFragment(source, ctx, 0, 0, options);
    }
    
    let verb = "appendChild";
    if (options !== undefined) {
      if (options.prepend) verb = "prepend";
      const callback = options.initializedCallback;
      if (callback !== undefined) callback(ctx, source, options);
    }
    if (isTemplate && target) {
      (<any>target)[verb](source);
    }
    return ctx;
}

function processFragment(  
    source: DocumentFragment | HTMLElement,
    ctx: RenderContext,
    idx: number,
    level: number,
    options?: RenderOptions,
){
    // for(const sym of Object.getOwnPropertySymbols(transform) ) {
    //     const transformTemplateVal = (<any>transform)[sym];
    //     const newTarget = ((<any>ctx)[sym] || (<any>ctx).host![sym]) as HTMLElement;
    //     switch(typeof(transformTemplateVal)){
    //       case 'function':
    //         transformTemplateVal({target: newTarget, ctx, idx, level, undefined});
    //         break;
    //       case 'string':
    //         newTarget.textContent = transformTemplateVal;
    //         break;
    //     }
    // }
    ctx.target = source.firstElementChild as HTMLElement | null;
    processEl(ctx, idx, level, false, null, options)
}

function processEl(
    ctx: RenderContext,
    idx: number,
    level: number,
    skipSibs: boolean,
    prevTransform: TransformValueOptions | null = null,
    options?: RenderOptions,  
){
    const target = ctx.target;
    if(target == null) return;
    
    const keys = Object.keys(ctx.Transform);
    if(keys.length === 0) return;
    
    const firstCharOfFirstProp = keys[0][0];
    let isNextStep = "SNTM".indexOf(firstCharOfFirstProp) > -1;
    if(isNextStep){
        doNextStep(target, ctx, idx, level, prevTransform, options);
        return;
    }
    let nextElementSibling: HTMLElement | null = target;
    const tm = ctx.Transform as TransformMatch;
    let matched = false;
    while(nextElementSibling !== null){
        for(let i = 0, ii = keys.length; i < ii; i++){
            const key = keys[i];
            if(key.startsWith('"')){
                if(!matched) continue;
            }else{
                if(!nextElementSibling.matches(key)) {
                    matched = false;
                    continue;
                }
            }
            matched = true;
            const tvo = getRHS(tm[key], ctx) as TransformValueOptions;
            switch(typeof tvo){
                case 'string':
                    target.textContent = tvo;
                    break;
                case 'boolean':
                    if(tvo === false) target.remove();
                    break;
                case 'object':
                    if(tvo === null) continue;
                    doObjectMatch(key, tvo as TransformValueObjectOptions, ctx);
                case 'undefined':
                    continue;    
            }
        }
        nextElementSibling = nextElementSibling.nextElementSibling as HTMLElement | null;
    }
}

function doObjectMatch(key: string, tvoo: TransformValueObjectOptions, ctx: RenderContext){
    if(Array.isArray(tvoo)){
        doArrayMatch(key, tvoo as TransformValueArrayOptions);
    }else{

    }
}

function doCSSMatch(key: string, tm: TransformMatch){

}

function doPropSetting(key: string, tm: TransformMatch, ctx: RenderContext){

}

function doArrayMatch(key: string, tvao: TransformValueArrayOptions){

}



function closestNextSib(target: HTMLElement, match: string){
    let nextElementSibling = target.nextElementSibling;
    while(nextElementSibling !== null){
        if(nextElementSibling.matches(match)) return nextElementSibling as HTMLElement;
        nextElementSibling = nextElementSibling.nextElementSibling;
    }
    return null;
}

function doNextStep(
    target: HTMLElement,
    ctx: RenderContext,
    idx: number,
    level: number,
    prevTransform: TransformValueOptions | null = null,
    options?: RenderOptions,  
){
    const nextStep = ctx.Transform as NextStep;
    let nextEl : HTMLElement | null;
    if(nextStep.NextMatch !== undefined){
        nextEl = closestNextSib(target, nextStep.NextMatch);
    }else if(nextStep.Select){
        nextEl = target.querySelector(nextStep.Select);
    }else{
        throw('?');
    }
    if(nextEl === null) return;
    const inherit = !!nextStep.MergeTransforms;
    const newTransform = nextStep.Transform;
    const mergedTransform = Object.assign({}, newTransform);
    if (prevTransform !== null && inherit) {
      Object.assign(mergedTransform, prevTransform);
    }
    ctx.Transform = mergedTransform;
    processEl(nextEl, ctx, idx, level, false, prevTransform, options);
}

function getRHS(expr: any, ctx: RenderContext): any{
    switch(typeof expr){
        case 'undefined':
        case 'string':
        case 'symbol':
        case 'boolean':
            return expr;
        case 'function':
            return getRHS(expr(ctx), ctx);
        case 'object':
            if(expr === null) return expr;
            if(!Array.isArray(expr) || expr.length === 0) return expr;
            const pivot = expr[0];
            switch(typeof pivot){
                case 'object':
                case 'undefined':
                    return expr;
                case 'function':
                    const val: any = expr[0](ctx);
                    return getRHS([val, ...expr.slice(1)], ctx);
                case 'boolean':
                    return getRHS(pivot ? expr[1] : expr[2], ctx)
                case 'string':
                case 'symbol':
                    if(expr.length === 2 && typeof(expr[1]) === 'object'){
                        return getRHS(expr[1][pivot], ctx);
                    }else{
                        throw '?';
                    }
                
            }
        case 'number':
            return expr.toString();

    }
}



