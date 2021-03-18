import { RenderContext, PMDo } from './types.d.js';
import { getQuery} from './specialKeys.js';
import { lispToCamel } from './lispToCamel.js';
import { matchByType } from './matchByType.js';

export function transform(
    sourceOrTemplate: HTMLElement | DocumentFragment,
    ctx: RenderContext,
    target: HTMLElement | DocumentFragment = sourceOrTemplate
){
    ctx.ctx = ctx;
    ctx.transform = transform;
    const isATemplate = isTemplate(sourceOrTemplate);
    const source = isATemplate
        ? (sourceOrTemplate as HTMLTemplateElement).content.cloneNode(true) as DocumentFragment
        : sourceOrTemplate;
    if(ctx.options?.cacheQueries){
        if(ctx.queryCache === undefined) ctx.queryCache = new WeakMap<HTMLElement, {[key: string]: NodeListOf<Element>}>();
    }
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
    const transf = ctx.match;
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
        ctx.match = transform;
        processTarget(ctx);
    }
}

function processTarget(
    ctx: RenderContext
){
    const target = ctx.target;
    const tr = ctx.match;
    if(target == null || tr === undefined) return true;
    if(target.nodeType !== 11 && target.hasAttribute('debug')) debugger;
    const keys = Object.keys(tr);
    if(keys.length === 0) return true;
    const scopeKeys: string[] = [];
    for(const key of keys){
        const queryInfo = key ==='*' ? {query: '*', type: 'all', attrib: ''} :  getQuery(key);
        if(queryInfo !== null){
            let matches: NodeListOf<Element> | undefined;
            let qcLookup: {[key: string]: NodeListOf<Element>} | undefined;
            const qc = ctx.queryCache;
            const query = queryInfo.query;
            if(qc !== undefined){
                if(qc.has(target)){
                    qcLookup = qc.get(target)!;
                    matches = qcLookup[query];
                }
            }
            if(matches === undefined){
                matches = target.querySelectorAll(query);
                if(qc !== undefined){
                    if(qcLookup !== undefined){
                        qcLookup[query] = matches;
                    }else{
                        qc.set(target, {[query]: matches});
                    }
                }       
            }
            for(const match of matches){
                const {val, target} = ctx;
                switch(queryInfo.type){
                    case 'data':
                        ctx.val = match.getAttribute(queryInfo.attrib);
                        break;
                    case 'prop':
                        (<any>match)[lispToCamel(queryInfo.attrib)] = tr[key];
                        continue;
                }

                ctx.target = match;
                ctx.idx!++;
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
                ctx.target = target;
            }
        }
    }
}

function doRHS(ctx: RenderContext, rhs: any){
    if(rhs === undefined) return;
    while(typeof rhs === 'function') rhs = rhs(ctx);
    const pm = ctx.postMatch;
    if(pm !== undefined){
        let  ctor: {new(): PMDo} | PMDo | undefined;
        for(const postMatch of pm){
            const result = matchByType(rhs, postMatch.rhsType);
            if(result > 0){
                ctor = postMatch.ctor;
                break;
            }
        }
        switch(typeof ctor){
            case 'undefined':
                return;
            case 'object':
                {
                    const prevRHS = ctx.rhs;
                    ctx.rhs = rhs;
                    doRHS(ctx, ctor.do(ctx));
                    ctx.rhs = prevRHS;
                }
                break;
            case 'function':
                {
                    const psDO = new ctor();
                    const prevRHS = ctx.rhs;
                    ctx.rhs = rhs;
                    doRHS(ctx, psDO.do(ctx));
                }
                break;

        }
    }

}

