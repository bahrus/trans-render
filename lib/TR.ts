import {RenderContext} from './types';
import { getQuery} from './specialKeys.js';
import { lispToCamel } from './lispToCamel.js';

export class TR{
    #queryCache = new WeakMap<Element | DocumentFragment, {[key: string]: WeakRef<Element>[]}>();
    static async transform(sourceOrTemplate: Element | DocumentFragment,
        ctx: RenderContext,
        target: Element | DocumentFragment = sourceOrTemplate){
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
    constructor(public ctx: RenderContext){}
    async transform(fragment: Element | DocumentFragment){
        const {ctx} = this;
        const {host, options, match} = ctx;
        const qc = this.#queryCache;
        if(!qc.has(fragment)){
            qc.set(fragment, {});
        }
        const matchMap = qc.get(fragment)!;
        for(const key in match){
            let rhs = match[key];
            const verb = 'do_' + typeof(rhs);
            if(key === ':host'){
                ctx.target = host;
                await (<any>this)[verb]();
                continue;
            }
            const queryInfo = getQuery(key);
            let fromCache = matchMap[key];
            if(fromCache !== undefined){
                fromCache = fromCache.filter(ref => {
                    const el = ref.deref();
                    if(el === undefined || !el.matches(queryInfo.query)) return false;
                    return true;
                });
                matchMap[key] = fromCache;
            }
            let matches = fromCache || (matchMap[key] = Array.from(fragment.querySelectorAll(queryInfo.query)).map(el => new WeakRef(el)));
            ctx.rhs = rhs;
            
            for(const el of matches){
                const match = el.deref()!;
                ctx.target = match;
                switch(queryInfo.type){
                    case 'attribs':
                        ctx.attrib = queryInfo.attrib;
                        ctx.val = match.getAttribute(queryInfo.attrib);
                        break;
                    case 'props':
                        (<any>match)[lispToCamel(queryInfo.attrib)] = rhs;
                        continue;
                }
                await (<any>this)[verb]();
            }
        }

        return ctx;
    }
    async do_string(){
        const {target, rhs, host}  = this.ctx;
        target!.textContent = (<any>host)[rhs as string];
    }
    do_number(){}
    do_boolean(){
        const {target, rhs} = this.ctx;
        if(rhs === false) target!.remove();
    }
    async do_object(){
        const {target, rhs, host, match} = this.ctx;
        this.ctx.match = {...match, ...rhs};
        await this.transform(target!);
        this.ctx.match = match;
    }
    do_function(){
        const ctx = this.ctx;
        const rhs = ctx.rhs(ctx);
        if(rhs === undefined) return;
        ctx.rhs = rhs;
        const verb = 'do_' + typeof(rhs);
        (<any>this)[verb]();
    }

    isTemplate(sourceOrTemplate: any){
        return sourceOrTemplate.localName === 'template';
    }
}