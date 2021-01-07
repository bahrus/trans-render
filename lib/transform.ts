import {RenderContext, PSDo} from './types.d.js';
import {getQuery} from './specialKeys.js';

export function transform(
    sourceOrTemplate: HTMLElement | DocumentFragment,
    ctx: RenderContext,
    target: HTMLElement | DocumentFragment = sourceOrTemplate
){
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

function processFragment(  
    source: DocumentFragment | HTMLElement | SVGElement,
    ctx: RenderContext
){
    const transf = ctx.tr;
    if(transf === undefined) return;
    const transforms = Array.isArray(transf) ? transf : [transf];
    const isInit = ctx.mode === undefined;
    for(var transform of transforms){
        const start = {level: 0, idx: 0} as Partial<RenderContext>;
        if(isInit){
            start.mode = 'init';
        }
        Object.assign<RenderContext, Partial<RenderContext>>(ctx, start);
        ctx.target = source as HTMLElement;
        ctx.tr = transform;
        processTarget(ctx);
    }
}

function processTarget(
    ctx: RenderContext
){
    const target = ctx.target;
    const tr = ctx.tr;
    if(target == null || tr === undefined) return true;
    if(target.hasAttribute('debug')) debugger;
    const keys = Object.keys(tr);
    if(keys.length === 0) return true;
    const scopeKeys: string[] = [];
    for(const key of keys){
        const queryInfo = getQuery(key);
        if(queryInfo !== null){
            for(const match of target.querySelectorAll(queryInfo.query)){
                const {val, target} = ctx;
                if(queryInfo.type === 'data'){
                    ctx.val = match.getAttribute(queryInfo.attrib);
                }
                ctx.target = match;
                doRHS(ctx, tr[key]);
                ctx.val = val;
                ctx.target = target;
            }
        }else{
            scopeKeys.push(key);
        }
    }
    
    for(const child of target.children){
        for(const key of scopeKeys){
            if(child.matches(key)){
                ctx.target = child;
                doRHS(ctx, tr[key]);
            }
        }
    }
}

function doRHS(ctx: RenderContext, rhs: any){
    while(typeof rhs === 'function') rhs = rhs(ctx);
    const psm = ctx.psm;
    if(psm !== undefined){
        let  ctor: {new(): PSDo} | PSDo | undefined;

        switch(typeof rhs){
            case 'string':
                ctor = psm.find(p => p.type === String)?.ctor;
                break;
            case 'boolean':
                ctor = psm.find(p => p.type === Boolean)?.ctor;
                break;
            case 'number':
                ctor = psm.find(p => p.type === Number)?.ctor;
                break;
            case 'object':
                ctor = psm.find(p => p.type === Object)?.ctor;
                break;
            case 'bigint':
                ctor = psm.find(p => p.type === BigInt)?.ctor;
                break;
            case 'symbol':
                ctor = psm.find(p => p.type === Symbol)?.ctor;
                break;

        }
        switch(typeof ctor){
            case 'undefined':
                return;
            case 'object':
                return ctor.do(ctx);
            case 'function':
                const psDO = new ctor();
                return psDO.do(ctx);
        }
    }

}

