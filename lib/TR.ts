import {RenderContext} from './types';
import { getQuery} from './specialKeys.js';
import { lispToCamel } from './lispToCamel.js';

export class TR{
    #queryCache = new WeakMap<Element | DocumentFragment | Element[], {[key: string]: WeakRef<Element>[]}>();
    static async transform(sourceOrTemplate: Element | DocumentFragment | Element[],
        ctx: RenderContext,
        target?: Element | DocumentFragment) {
        const tr = this.new(ctx);
        const isATemplate = tr.isTemplate(sourceOrTemplate);
        const source = isATemplate
        ? (sourceOrTemplate as HTMLTemplateElement).content.cloneNode(true) as DocumentFragment
        : sourceOrTemplate;
        await tr.transform(source);
        let verb = "appendChild";
        const {options} = ctx;
        if (options !== undefined) {
          if (options.prepend) verb = "prepend";
        }
        if (isATemplate && target) {
          (<any>target)[verb](source);
        }
        return tr;
    }
    static new(ctx: RenderContext){
        ctx.ctx = ctx;
        return new TR(ctx);
    }
    constructor(public ctx: RenderContext){
        if(ctx.ctx === undefined) ctx.ctx = ctx;
    }
    async transform(fragment: Element | DocumentFragment | Element[]) {
        const {ctx} = this;
        const {host, options, match} = ctx;
        const qc = this.#queryCache;
        const isArray = Array.isArray(fragment);
        if(!isArray && !qc.has(fragment)){
            qc.set(fragment, {});
        }
        const matchMap = isArray ? {} :  qc.get(fragment)!;
        for(const key in match){
            let rhs = match[key];
            const verb = 'do_' + typeof(rhs);
            if(key === ':host'){
                ctx.target = host;
                ctx.rhs = rhs;
                delete(ctx.queryInfo);
                await (<any>this)[verb](ctx);
                continue;
            }
            const queryInfo = getQuery(key);
            ctx.queryInfo = queryInfo;
            const {query} = queryInfo;
            let fromCache = matchMap[key];
            if(fromCache !== undefined){
                fromCache = fromCache.filter(ref => {
                    const el = ref.deref();
                    if(el === undefined || !el.matches(query)) return false;
                    return true;
                });
                matchMap[key] = fromCache;
            }
            let matches = (isArray ? 
                                    (fragment as Element[]).filter(x => x.matches(query)) 
                                  : fromCache || (matchMap[key] = Array.from((fragment as DocumentFragment).querySelectorAll(query)).map(el => new WeakRef(el)))) as (Element | WeakRef<Element>)[];
            if(fragment instanceof Element){
                if(fragment.matches(query)) {
                    matchMap[key].push(new WeakRef(fragment));
                    matches.push(fragment);
                }
            }
            if(rhs === true){
                (<any>host)[key] = matches;
                continue;
            }
            ctx.rhs = rhs;
            
            for(const el of matches){
                const matchingElement = el instanceof Element ? el : el.deref()!;
                ctx.target = matchingElement;
                switch(queryInfo.type){
                    case 'attribs':
                        ctx.attrib = queryInfo.attrib;
                        ctx.val = matchingElement.getAttribute(queryInfo.attrib!);
                        break;
                    case 'props':
                        (<any>matchingElement)[lispToCamel(queryInfo.attrib!)] = rhs;
                        continue;
                }
                await (<any>this)[verb](ctx);
            }
        }

        return ctx;
    }
    flushCache(){
        this.#queryCache = new WeakMap<Element | DocumentFragment, {[key: string]: WeakRef<Element>[]}>();
    }
    async eval_string(){
        const {target, rhs, host}  = this.ctx;
        const {getVal} = await import('./getVal.js');
        return getVal(host, rhs);
    }
    async do_string({target}: RenderContext){
        const val = await this.eval_string();
        target!.textContent = val;  
    }
    do_number(){}
    do_boolean({target, rhs}: RenderContext){
        if(rhs === false) target!.remove();
    }
    async do_object({target, rhs, host, match, queryInfo}: RenderContext){
        const lhsProp = queryInfo?.lhsProp;
        if(lhsProp){
            (<any>target)[lhsProp] = rhs;
        }else{
            this.ctx.match = {...rhs};
            await this.transform(target!);
            this.ctx.match = match;
        }

    }
    async do_function(){
        const ctx = this.ctx;
        const rhs = ctx.rhs(ctx);
        if(rhs === undefined) return;
        ctx.rhs = rhs;
        const verb = 'do_' + typeof(rhs);
        await (<any>this)[verb](ctx);
    }

    isTemplate(sourceOrTemplate: any){
        return sourceOrTemplate.localName === 'template';
    }
}