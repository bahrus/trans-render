import {
    RenderContext, 
    RenderOptions, 
    NextStep, 
    TransformValueOptions, 
    TransformMatch,
    TransformValueObjectOptions,
    TransformValueArrayOptions,
    ATRIUM_Union
} from './types2.js';
import { PEATUnionSettings } from './types.js';

const SkipSibs = Symbol();
const NextMatch = Symbol();

export async function transform(
    sourceOrTemplate: HTMLElement | DocumentFragment,
    ctx: RenderContext,
    target: HTMLElement | DocumentFragment = sourceOrTemplate,
){
    if(ctx.mode === undefined){
        Object.assign<RenderContext, Partial<RenderContext>>(ctx, {mode: 'init', level: 0, idx: 0})
    }
    const isTemplate = (sourceOrTemplate as HTMLElement).localName === "template";
    const source = isTemplate
      ? (sourceOrTemplate as HTMLTemplateElement).content.cloneNode(true) as DocumentFragment
      : sourceOrTemplate;
    if(ctx.Transform !== undefined){
        await processFragment(source, ctx);
    }
    
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

function copyCtx(ctx: RenderContext){
    return Object.assign({}, ctx) as RenderContext;
}

function restoreCtx(ctx: RenderContext, originalCtx: RenderContext){
    return (Object.assign(ctx, originalCtx));
}

async function processFragment(  
    source: DocumentFragment | HTMLElement,
    ctx: RenderContext
){
    const transf = ctx.Transform!;
    for(const sym of Object.getOwnPropertySymbols(transf) ) {
        const transformTemplateVal = (<any>transf)[sym];
        const newTarget = ((<any>ctx)[sym] || (<any>ctx).host![sym]) as HTMLElement;
        ctx.target = newTarget;
        switch(typeof(transformTemplateVal)){
          case 'function':
            transformTemplateVal(ctx);
            break;
          case 'string':
            newTarget.textContent = transformTemplateVal;
            break;
        }
    }
    ctx.target = source.firstElementChild as HTMLElement;
    await processEl(ctx);
}

async function processEl(
    ctx: RenderContext
){
    const target = ctx.target;
    if(target == null || ctx.Transform === undefined) return;
    
    const keys = Object.keys(ctx.Transform);
    if(keys.length === 0) return;
    
    const firstCharOfFirstProp = keys[0][0];
    let isNextStep = "SNTM".indexOf(firstCharOfFirstProp) > -1;
    if(isNextStep){
        await doNextStepSelect(ctx);
        doNextStepSibling(ctx)
    }
    let nextElementSibling: HTMLElement | null = target;
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
                    await doObjectMatch(key, tvo as TransformValueObjectOptions, ctx);
                    break;
                case 'symbol':
                    const cache = ctx.host || ctx;
                    (<any>cache)[tvo] = nextElementSibling; 
                case 'undefined':
                    continue;    
            }
        }
        const elementToRemove = removeNextElementSibling ? nextElementSibling : undefined;
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
}

async function doObjectMatch(key: string, tvoo: TransformValueObjectOptions, ctx: RenderContext){
    if(Array.isArray(tvoo)){
        await doArrayMatch(key, tvoo as TransformValueArrayOptions, ctx);
    }else{
        if(isTemplate(tvoo as HTMLTemplateElement)){
            doTemplate(ctx, tvoo as HTMLTemplateElement);
        }else{
            const ctxCopy = copyCtx(ctx);
            ctx.Transform = tvoo; //TODO -- don't do this line if this is a property setting
            const keys = Object.keys(tvoo);
            const firstCharOfFirstProp = keys[0][0];
            let isNextStep = "SNTM".indexOf(firstCharOfFirstProp) > -1;
            if(isNextStep){
                await doNextStepSelect(ctx);
                doNextStepSibling(ctx);
            }else{
                ctx.target = ctx.target!.firstElementChild as HTMLElement;
                ctx.level!++;
                ctx.idx = 0;
                ctx.previousTransform = ctx.Transform;
                await processEl(ctx);
            }
            restoreCtx(ctx, ctxCopy);
        }
    }
}

function isTemplate(test: HTMLTemplateElement){
    return test.localName === 'template' && test.content && (typeof test.content.cloneNode === 'function');
}

function doTemplate(ctx: RenderContext, te: HTMLTemplateElement){
    const clone = te.content.cloneNode(true);
    if(te.dataset.shadowRoot !== undefined){
      ctx.target!.attachShadow({mode: te.dataset.shadowRoot as 'open' | 'closed', delegatesFocus: true}).appendChild(clone)
    }else{
      ctx.target!.appendChild(clone);
    }
}

async function doArrayMatch(key: string, tvao: TransformValueArrayOptions, ctx: RenderContext){
    const firstEl = tvao[0];
    switch(typeof firstEl){
        case 'undefined':
        case 'object':
            if(Array.isArray(firstEl)){
                await doRepeat(key, tvao as ATRIUM_Union, ctx); 
            }else{
                doPropSetting(key, tvao as PEATUnionSettings, ctx);
            }
            
            break;
    }
}

function doPropSetting(key: string, peat: PEATUnionSettings, ctx: RenderContext){
    const len = peat.length;
    const target = ctx.target as HTMLElement;
    if (len > 0) {
      //////////  Prop Setting
      /////////   Because of dataset, style (other?) assign at one level down
      const props = peat[0];
      if(props !== undefined){
        Object.assign(target, props);
        if(props.style !== undefined) Object.assign(target.style, props.style);
        if(props.dataset !== undefined) Object.assign(target.dataset, props.dataset);
      }
    }
    if (len > 1 && peat[1] !== undefined) {
      /////////  Event Handling
      const eventSettings = peat[1];
      for (const key in eventSettings) {
        let eventHandler = eventSettings[key];
        if(Array.isArray(eventHandler)){
          const objSelectorPath = eventHandler[1].split('.');
          const converter = eventHandler[2];
          const originalEventHandler = ctx.host !== undefined ? eventHandler[0].bind(ctx.host) : eventHandler[0];
          eventHandler = (e: Event) =>{
            let val = getProp(e.target, objSelectorPath);
            if(converter !== undefined) val = converter(val);
            originalEventHandler(val, e);
          }
        }else if(ctx.host !== undefined){
          eventHandler = eventHandler.bind(ctx.host);
        }
        target.addEventListener(key, eventHandler as EventListenerOrEventListenerObject);
      }
    }
    if (len > 2 && peat[2] !== undefined) {
      /////////  Attribute Setting
      for (const key in peat[2]) {
        const val = peat[2][key];
        switch (typeof val) {
          case 'boolean':
            if (val) {
              target.setAttribute(key, '');
            } else {
              target.removeAttribute(key);
            }
            break;
          case 'string':
            target.setAttribute(key, val);
            break;
          case 'number':
            target.setAttribute(key, val.toString());
            break;
          case 'object':
            if(val === null) target.removeAttribute(key);
            break;
        }
      }
    }
}

async function doRepeat(key: string, atriums: ATRIUM_Union, ctx: RenderContext){
    const mode = ctx.mode;
    const {repeateth} = await import('./repeateth2.js');
    const newMode = ctx.mode;
    //ctx.mode = mode;
    const transform = repeateth(atriums[1], ctx, atriums[0], ctx.target!, atriums[3], atriums[4]);
    //ctx.mode = newMode;
}

export function getProp(val: any, pathTokens: string[]){
    let context = val;
    for(const token of pathTokens){
      context = context[token];
      if(context === undefined) break;
    }
    return context;
  }





function closestNextSib(target: HTMLElement, match: string){
    let nextElementSibling = target.nextElementSibling;
    while(nextElementSibling !== null){
        if(nextElementSibling.matches(match)) return nextElementSibling as HTMLElement;
        nextElementSibling = nextElementSibling.nextElementSibling;
    }
    return null;
}

async function doNextStepSelect(
    ctx: RenderContext,
){
    const nextStep = ctx.Transform as NextStep;
    if(nextStep.Select === undefined) return;
    let nextEl = ctx.target!.querySelector(nextStep.Select) as HTMLElement | null;
    if(nextEl === null) return;
    const inherit = !!nextStep.MergeTransforms;
    const newTransform = nextStep.Transform;
    const mergedTransform = Object.assign({}, newTransform);
    if (ctx.previousTransform !== undefined && inherit) {
      Object.assign(mergedTransform, ctx.previousTransform);
    }
    const copy = copyCtx(ctx);
    ctx.Transform = mergedTransform;
    ctx.target = nextEl;
    await processEl(ctx);
    restoreCtx(ctx, copy);
}

function doNextStepSibling(
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



