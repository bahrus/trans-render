import {
    RenderContext, 
    RenderOptions, 
    NextStep, 
    TransformValueOptions, 
    TransformMatch,
    TransformValueObjectOptions,
    TransformValueArrayOptions,
    ATRIUM_Union,
    PEATUnionSettings,
    PluginPromises
} from './types2.js';


const SkipSibs = Symbol();
const NextMatch = Symbol();

type doObjectMatchFnSig = (key: string, tvoo: TransformValueObjectOptions, ctx: RenderContext) => void;

let  doObjMtch: undefined | doObjectMatchFnSig;

export let pluginLookup: any = {};

export async function doImports(objHandler: boolean = true, repeat: boolean = true, plugins?: PluginPromises){
    const {doObjectMatch, repeatethFnContainer} = await import('./doObjectMatch.js');
    doObjMtch = doObjectMatch;
    if(repeat && repeatethFnContainer.repeateth === undefined){
        const {repeateth} = await import('./repeateth2.js');
        repeatethFnContainer.repeateth = repeateth; 
    }
    if(plugins !== undefined){
        const pluginList = await Promise.all(plugins);
        pluginList.forEach(plugin =>{
            pluginLookup[plugin.sym] = plugin.fn;
        })
    }
    return pluginLookup;
}

export function transform(
    sourceOrTemplate: HTMLElement | DocumentFragment,
    ctx: RenderContext,
    target: HTMLElement | DocumentFragment = sourceOrTemplate,
){
    if(ctx.mode === undefined){
        Object.assign<RenderContext, Partial<RenderContext>>(ctx, {mode: 'init', level: 0, idx: 0})
    }
    // const pluginPromises = ctx.pluginPromises;
    // if(ctx.mode === 'init' && pluginPromises !== undefined){
    //     const plugins = await Promise.all(pluginPromises);
    //     if(ctx.plugins === undefined) ctx.plugins = {};
    //     plugins.forEach(plugin =>{
    //         ctx.plugins[plugin.sym as any as string] = plugin; //https://github.com/microsoft/TypeScript/issues/1863
    //     });
    // }
    ctx.ctx = ctx;
    const isTemplate = (sourceOrTemplate as HTMLElement).localName === "template";
    const source = isTemplate
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
    if (isTemplate && target) {
      (<any>target)[verb](source);
    }
    ctx.mode = 'update';
    return ctx;
}

// function init(
//     sourceOrTemplate: HTMLElement | DocumentFragment | SVGElement,
//     ctx: RenderContext,
//     target: HTMLElement | DocumentFragment | SVGElement = sourceOrTemplate,){
// }

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
    for(const sym of Object.getOwnPropertySymbols(transf) ) {
        const transformTemplateVal = (<any>transf)[sym];
        const newTarget = ((<any>ctx)[sym] || (<any>ctx).host![sym]) as HTMLElement | SVGElement;
        ctx.target = newTarget;
        switch(typeof(transformTemplateVal)){
          case 'function':
            transformTemplateVal(ctx);
            break;
          case 'string':
            newTarget.textContent = transformTemplateVal;
            break;
          case 'object':
              doObjMtch!('', transformTemplateVal as TransformValueObjectOptions, ctx);
              break;
        }
    }
    ctx.target = source.firstElementChild as HTMLElement;
    processEl(ctx);
}

export function processEl(
    ctx: RenderContext
){
    const target = ctx.target;
    if(target == null || ctx.Transform === undefined) return true;
    
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
            if(key.startsWith('"')){
                if(!matched) continue;
            }else{
                if(!nextElementSibling.matches(key)) {
                    matched = false;
                    continue;
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
                    doObjMtch!(key, tvo as TransformValueObjectOptions, ctx);
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
                    return expr;
                case 'function':
                    const val: any = expr[0](ctx);
                    return getRHS([val, ...expr.slice(1)], ctx);
                case 'boolean':
                    return getRHS(pivot ? expr[1] : expr[2], ctx)
                case 'string':
                    if(expr.length === 2 && typeof(expr[1]) === 'object'){
                        return getRHS(expr[1][pivot], ctx);
                    }else{
                        throw '?';
                    }
                case 'symbol':
                    return pluginLookup[pivot](ctx, expr);
            }
        case 'number':
            return expr.toString();

    }
}



