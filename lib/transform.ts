import { RenderContext, PMDo } from './types.d.js';
import { getQuery} from './specialKeys.js';
import { lispToCamel } from './lispToCamel.js';
import { matchByType } from './matchByType.js';
import { linkTemplates } from './linkTemplates.js';

export async function transform(
    sourceOrTemplate: Element | DocumentFragment,
    ctx: RenderContext,
    target: Element | DocumentFragment = sourceOrTemplate
){

    ctx.ctx = ctx;
    ctx.transform = transform;
    const isATemplate = isTemplate(sourceOrTemplate);
    const source = isATemplate
        ? (sourceOrTemplate as HTMLTemplateElement).content.cloneNode(true) as DocumentFragment
        : sourceOrTemplate;
    const {host, options, templateIds} = ctx;
    if(options?.cacheQueries || ctx.host){
        if(ctx.queryCache === undefined) ctx.queryCache = new WeakMap<HTMLElement, {[key: string]: NodeListOf<Element>}>();
    }
    if(ctx.host !== undefined && ctx.templateIds !== undefined){
        linkTemplates(sourceOrTemplate as Element, ctx.host, ctx.templateIds);
    }
    processFragment(source, ctx);
    let verb = "appendChild";
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
    source: DocumentFragment | Element,
    ctx: RenderContext
){
    const {match} = ctx;
    if(match === undefined) return;
    const transforms = Array.isArray(match) ? match : [match];
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

export function processTargets(
    ctx: RenderContext,
    elements: Element[]
){
    const {match} = ctx;
    
    for(const key in match){
        const queryInfo = getQuery(key);
        const query = queryInfo.query;
        let matches: Element[] = [];
        //TODO:  use cache?
        for(const element of elements){
            matches = [...matches, ...Array.from(element.querySelectorAll(query))];
            if(element.matches(query)) matches.push(element);
        }
        doMatches(ctx, matches, queryInfo, match, key);
    }
}

function processTarget(
    ctx: RenderContext
){
    const {target, match} = ctx;
    if(target == null || match === undefined) return true;
    if(target.nodeType !== 11 && target.hasAttribute('debug')) debugger;
    const keys = Object.keys(match);
    if(keys.length === 0) return true;
    for(const key of keys){
        const queryInfo = getQuery(key);
        let matches: NodeListOf<Element> | undefined;
        if(ctx.host !== undefined && key === ':host'){
            doMatches(ctx, [ctx.host], queryInfo, match, key);
            continue;
        }
        const qc = ctx.queryCache;
        
        if(qc !== undefined){
            if(qc instanceof WeakMap){
                let qcLookup: {[key: string]: NodeListOf<Element>} | undefined;
                if(qc.has(target)){
                    qcLookup = qc.get(target)!;
                    matches = qcLookup[key];
                }
            }else{
                matches = qc[key]
            }
        }
        if(matches === undefined || !(matches instanceof NodeList)){
            
            const query = queryInfo.query;
            matches = target.querySelectorAll(query);
            if(qc !== undefined){
                let qcLookup: {[key: string]: NodeListOf<Element>} | undefined;
                if(qc.has(target)){
                    qc.get(target)![key] = matches;
                }else{
                    qc.set(target, {[key]: matches});
                }
            }       
        }
        doMatches(ctx, Array.from(matches), queryInfo, match, key);
    }     
}
function doMatches(ctx: RenderContext, matches: Element[], queryInfo: any, match: any, key: string){
    for(const matchedElement of matches){
        const {val, target, attrib} = ctx;
        switch(queryInfo.type){
            case 'attribs':
                ctx.attrib = queryInfo.attrib;
                ctx.val = matchedElement.getAttribute(queryInfo.attrib);
                break;
            case 'props':
                (<any>matchedElement)[lispToCamel(queryInfo.attrib)] = match[key];
                continue;
        }

        ctx.target = matchedElement;
        ctx.idx!++;
        ctx.key = key;
        doRHS(ctx, match[key]);
        ctx.val = val;
        ctx.attrib = attrib;
        ctx.target = target;
    }   
}

function doRHS(ctx: RenderContext, rhs: any){
    if(rhs === undefined) return;
    if(ctx.abort === true) return;
    while(typeof rhs === 'function') rhs = rhs(ctx);
    while(ctx.plugins !== undefined && ctx.plugins[rhs] !== undefined){
        rhs = ctx.plugins[rhs].processor(ctx);
    }
    const pm = ctx.postMatch;
    if(pm !== undefined){
        let  ctor: {new(): PMDo} | PMDo | undefined;
        for(const postMatch of pm){
            const result = matchByType(rhs, postMatch.rhsType, postMatch.rhsHeadType);
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
                    ctx.rhs = prevRHS;
                }
                break;

        }
    }

}

