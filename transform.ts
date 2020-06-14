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
    ctx.level = 0;
    ctx.idx = 0;
    ctx.options = options;
    const isTemplate = (sourceOrTemplate as HTMLElement).localName === "template";
    const source = isTemplate
      ? (sourceOrTemplate as HTMLTemplateElement).content.cloneNode(true) as DocumentFragment
      : sourceOrTemplate;
    if(ctx.Transform !== undefined){
        processFragment(source, ctx);
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

function copyCtx(ctx: RenderContext){
    return Object.assign({}, ctx) as RenderContext;
}

function restoreCtx(ctx: RenderContext, originalCtx: RenderContext){
    return (Object.assign(ctx, originalCtx));
}

function processFragment(  
    source: DocumentFragment | HTMLElement,
    ctx: RenderContext
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
    ctx.target = source.firstElementChild as HTMLElement;
    processEl(ctx);
}

function processEl(
    ctx: RenderContext
){
    const target = ctx.target;
    if(target == null) return;
    
    const keys = Object.keys(ctx.Transform);
    if(keys.length === 0) return;
    
    const firstCharOfFirstProp = keys[0][0];
    let isNextStep = "SNTM".indexOf(firstCharOfFirstProp) > -1;
    if(isNextStep){
        doNextStep(ctx);
        return;
    }
    let nextElementSibling: HTMLElement | null = target;
    const tm = ctx.Transform as TransformMatch;
    let matched = false;
    
    while(nextElementSibling !== null){
        let removeNextElementSibling = false;
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
                    nextElementSibling.textContent = tvo;
                    break;
                case 'boolean':
                    if(tvo === false) removeNextElementSibling = true;
                    break;
                case 'object':
                    if(tvo === null) continue;
                    ctx.target = nextElementSibling;
                    doObjectMatch(key, tvo as TransformValueObjectOptions, ctx);
                case 'undefined':
                    continue;    
            }
        }
        const elementToRemove = removeNextElementSibling ? nextElementSibling : undefined;
        nextElementSibling = nextElementSibling.nextElementSibling as HTMLElement | null;
        if(elementToRemove !== undefined) elementToRemove.remove();
    }
}

function doObjectMatch(key: string, tvoo: TransformValueObjectOptions, ctx: RenderContext){
    if(Array.isArray(tvoo)){
        doArrayMatch(key, tvoo as TransformValueArrayOptions);
    }else{
        if(isTemplate(tvoo as HTMLTemplateElement)){
            doTemplate(ctx, tvoo as HTMLTemplateElement);
        }else{
            const ctxCopy = copyCtx(ctx);
            ctx.target = ctx.target!.firstElementChild as HTMLElement;
            ctx.level++;
            ctx.idx = 0;
            ctx.previousTransform = ctx.Transform;
            ctx.Transform = tvoo;
            processEl(ctx);
            restoreCtx(ctx, ctxCopy);
        }
    }
}

function isTemplate(test: HTMLTemplateElement){
    return test.localName === 'template' && test.content && (typeof test.content.cloneNode === 'function');
}

function doTemplate(ctx: RenderContext, te: HTMLTemplateElement){
    ctx.target!.appendChild(te.content.cloneNode(true));
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
    ctx: RenderContext,
){
    const nextStep = ctx.Transform as NextStep;
    let nextEl : HTMLElement | null;
    if(nextStep.Select !== undefined){
        nextEl = ctx.target!.querySelector(nextStep.Select);
    }else if(nextStep.NextMatch !== undefined){
        nextEl = closestNextSib(ctx.target!, nextStep.NextMatch);
    }else{
        throw('?');
    }
    if(nextEl === null) return;
    const inherit = !!nextStep.MergeTransforms;
    const newTransform = nextStep.Transform;
    const mergedTransform = Object.assign({}, newTransform);
    if (ctx.previousTransform !== undefined && inherit) {
      Object.assign(mergedTransform, ctx.previousTransform);
    }
    ctx.Transform = mergedTransform;
    ctx.target = nextEl;
    processEl(ctx);
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



