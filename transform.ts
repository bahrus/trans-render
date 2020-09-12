import {
    RenderContext, 
    NextStep, 
    TransformValueOptions, 
    TransformMatch,
    TransformValueObjectOptions,
} from './types.js';


const SkipSibs = Symbol();
const NextMatch = Symbol();
export const more = Symbol.for('e35fe6cb-78d4-48fe-90f8-bf9da743d532');

export function transform(
    sourceOrTemplate: HTMLElement | DocumentFragment,
    ctx: RenderContext,
    target: HTMLElement | DocumentFragment = sourceOrTemplate,
){
    if(ctx.mode === undefined){
        Object.assign<RenderContext, Partial<RenderContext>>(ctx, {mode: 'init', level: 0, idx: 0})
    }

    ctx.ctx = ctx;
    const isATemplate = isTemplate(sourceOrTemplate);
    const source = isATemplate
      ? (sourceOrTemplate as HTMLTemplateElement).content.cloneNode(true) as DocumentFragment
      : sourceOrTemplate;
    
    processFragment(source, ctx);
    
    let verb = "appendChild";
    const options = ctx.options;
    if (options !== undefined) {
      if (options.prepend) verb = "prepend";
      const callback = options.initializedCallback;
      if (callback !== undefined) callback(ctx, source, options);
    }
    if (isATemplate && target) {
      (<any>target)[verb](source);
    }
    ctx.mode = 'update';
    return ctx;
}

export function isTemplate(test: any | undefined){
    return test !== undefined && test.localName === 'template' && test.content && (typeof test.content.cloneNode === 'function');
}

export function copyCtx(ctx: RenderContext){
    return Object.assign({}, ctx) as RenderContext;
}

export function restoreCtx(ctx: RenderContext, originalCtx: RenderContext){
    return (Object.assign(ctx, originalCtx));
}

export function processFragment(  
    source: DocumentFragment | HTMLElement | SVGElement,
    ctx: RenderContext
){
    const transf = ctx.Transform;
    if(transf === undefined) return;
    ctx.target = source.firstElementChild as HTMLElement;
    processEl(ctx);
    processSymbols(ctx);
}

export function processSymbols(ctx: RenderContext){
    const transf = ctx.Transform;
    for(const sym of Object.getOwnPropertySymbols(transf) ) {

        const transformTemplateVal = (<any>transf)[sym];
        if(sym === more){
            ctx.Transform = transformTemplateVal;
            processSymbols(ctx);
            ctx.Transform = transf;
        }
        const newTarget = ((<any>ctx)[sym] || (<any>ctx).host![sym]) as HTMLElement | SVGElement;
        if(newTarget === undefined) continue;
        ctx.target = newTarget;
        switch(typeof(transformTemplateVal)){
          case 'function':
            transformTemplateVal(ctx);
            break;
          case 'string':
            newTarget.textContent = transformTemplateVal;
            break;
          case 'object':
              ctx.customObjProcessor!('', transformTemplateVal as TransformValueObjectOptions, ctx);
              break;
        }
    }
}

export function processEl(
    ctx: RenderContext
){
    const target = ctx.target;
    if(target == null || ctx.Transform === undefined) return true;
    if(target.hasAttribute('debug')) debugger;
    const keys = Object.keys(ctx.Transform);
    if(keys.length === 0) return true;
    
    const firstCharOfFirstProp = keys[0][0];
    let isNextStep = "SNTM".indexOf(firstCharOfFirstProp) > -1;
    if(isNextStep){
        doNextStepSelect(ctx);
        doNextStepSibling(ctx)
    }
    let nextElementSibling: HTMLElement | SVGElement | null = target;
    const tm = ctx.Transform as TransformMatch;
    let matched = false;
    
    while(nextElementSibling !== null){
        if(ctx.itemTagger !== undefined) ctx.itemTagger(nextElementSibling);
        let removeNextElementSibling = false;
        for(let i = 0, ii = keys.length; i < ii; i++){
            const key = keys[i];
            if(key==='debug') {
                debugger;
                continue;
            }
            if(key.startsWith('"')){
                if(!matched) continue;
            }else{
                let modifiedSelector = key;
                if(key === ':host'){
                    if(nextElementSibling !== ctx.host){
                        matched = false;
                    }
                }else if(key.startsWith(':has(')){
                    const query = key.substring(5, key.length - 1);
                    if(nextElementSibling.querySelector(query) === null){
                        matched = false;
                        continue;
                    }
                }
                else{
                    if(key.endsWith('Part')){
                        modifiedSelector = `[part="${key.substring(0, key.length - 4)}"]`;
                    }
                    if(!nextElementSibling.matches(modifiedSelector)) {
                        matched = false;
                        continue;
                    }

                }
            }
            matched = true;
            ctx.target = nextElementSibling;
            const tvo = getRHS(tm[key], ctx) as TransformValueOptions;
            if(key.endsWith(']')){
                //TODO use named capture group reg expression
                const pos = key.lastIndexOf('[');
                if(pos > -1 && key[pos + 1] === '-'){
                    const propName = lispToCamel(key.substring(pos + 2, key.length - 1));
                    (<any>nextElementSibling)[propName] = tvo;
                    continue;
                }
            }
            switch(typeof tvo){
                case 'string':
                    nextElementSibling.textContent = tvo;
                    break;
                case 'boolean':
                    if(tvo === false) removeNextElementSibling = true;
                    break;
                case 'object':
                    if(tvo === null) continue;
                    ctx.customObjProcessor!(key, tvo as TransformValueObjectOptions, ctx);
                    break;
                case 'symbol':
                    const cache = ctx.host || ctx;
                    (<any>cache)[tvo] = nextElementSibling; 
                case 'undefined':
                    continue;    
            }
        }
        const elementToRemove = (removeNextElementSibling || nextElementSibling.dataset.deleteMe === 'true' ) ? 
            nextElementSibling : undefined;
        const nextMatch = (<any>nextElementSibling)[NextMatch];
        const prevEl = <any>nextElementSibling;
        if(prevEl[SkipSibs]){
            nextElementSibling = null;
        }else if(nextMatch !== undefined){
            nextElementSibling = closestNextSib(nextElementSibling, nextMatch);
        }else{
            nextElementSibling = nextElementSibling.nextElementSibling as HTMLElement | null;
        }
        prevEl[SkipSibs] = false;
        prevEl[NextMatch] = undefined;
        if(elementToRemove !== undefined) elementToRemove.remove();
    }
    return true;
}

const stcRe = /(\-\w)/g;
export function lispToCamel(s: string){
    return s.replace(stcRe, function(m){return m[1].toUpperCase();});
}


export function getProp(val: any, pathTokens: string[]){
    let context = val;
    for(const token of pathTokens){
      context = context[token];
      if(context === undefined) break;
    }
    return context;
}


function closestNextSib(target: HTMLElement | SVGElement, match: string){
    let nextElementSibling = target.nextElementSibling;
    while(nextElementSibling !== null){
        if(nextElementSibling.matches(match)) return nextElementSibling as HTMLElement;
        nextElementSibling = nextElementSibling.nextElementSibling;
    }
    return null;
}

export function doNextStepSelect(
    ctx: RenderContext,
){
    const nextStep = ctx.Transform as NextStep;
    if(nextStep.Select === undefined) return;
    let nextEl = ctx.target!.querySelector(nextStep.Select) as HTMLElement | null;
    if(nextEl === null) return;
    const inherit = !!nextStep.MergeTransforms;
    let mergedTransform = nextStep.Transform || ctx.previousTransform;
    if(inherit && nextStep.Transform){
        const newTransform = nextStep.Transform;
        mergedTransform = Object.assign({}, newTransform);
        if (ctx.previousTransform !== undefined && inherit) {
          Object.assign(mergedTransform, ctx.previousTransform);
        }
    }
    const copy = copyCtx(ctx);
    ctx.Transform = mergedTransform;
    ctx.target = nextEl;
    processEl(ctx);
    restoreCtx(ctx, copy);
}

export function doNextStepSibling(
    ctx: RenderContext
){
    const nextStep = ctx.Transform as NextStep;
    const aTarget = <any>ctx.target;
    (aTarget)[SkipSibs] = nextStep.SkipSibs || (aTarget)[SkipSibs];
    aTarget[NextMatch] = (aTarget[NextMatch] === undefined) ? nextStep.NextMatch : aTarget[NextMatch] + ', ' + nextStep.NextMatch;
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
                case 'string':
                    return expr;
                case 'function':
                    const val: any = expr[0](ctx);
                    return getRHS([val, ...expr.slice(1)], ctx);
                case 'boolean':
                    if(isTemplate(expr[1])) return expr;
                    return getRHS(pivot ? expr[1] : expr[2], ctx);
                case 'symbol':
                    return (<any>ctx)[pivot as any as string].fn(ctx, expr);
            }
        case 'number':
            return expr.toString();

    }
}



