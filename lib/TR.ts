import {QueryInfo, RenderContext, Transformer, ITSChecker} from './types';
import { getQuery} from './specialKeys.js';
import { lispToCamel } from './lispToCamel.js';
const timeStampCache: Map<string, WeakMap<Element, ITSChecker>> = new Map();

export class TR implements Transformer{
    //#queryCache = new WeakMap<Element | DocumentFragment | Element[], {[key: string]: WeakRef<Element>[]}>();
    #queryCache: {[key: string]: WeakRef<Element>[]} = {};
    static async transform(sourceOrTemplate: Element | DocumentFragment | Element[],
        ctx: RenderContext,
        target?: Element | DocumentFragment, fragmentManager?: Element) {
        const tr = this.new(ctx);
        const isATemplate = tr.isTemplate(sourceOrTemplate);
        const source = isATemplate
        ? (sourceOrTemplate as HTMLTemplateElement).content.cloneNode(true) as DocumentFragment
        : sourceOrTemplate;
        await tr.transform(source, fragmentManager);
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
        ctx.self = this;
    }
    async transform(fragment: Element | DocumentFragment | Element[], fragmentManager?: Element) {
        const {ctx} = this;
        const {host, options, match, timestampKey} = ctx;
        if(host !== undefined && timestampKey){
            if(!timeStampCache.has(timestampKey)){
                timeStampCache.set(timestampKey, new WeakMap<Element, ITSChecker>());
            }
            const wm = timeStampCache.get(timestampKey);
            if(!wm!.has(host)){
                const {TSChecker} = await import('./tsChecker.js');
                wm!.set(host, new TSChecker(timestampKey));
            }
            const tsc = wm!.get(host)!;
            const elementKey = fragmentManager ? fragmentManager : fragment as Element;
            if(tsc.notChanged(host, elementKey)) return ctx;
        }
        const qc = this.#queryCache;
        const isArray = Array.isArray(fragment);
        const matchMap = isArray ? {} :  qc;
        let prevKey = undefined;
        let queryInfo : QueryInfo | undefined;
        let matches: (Element | WeakRef<Element>)[]  = [];
        for(const key in match){
            let rhs = match[key];
            const verb = 'do_' + typeof(rhs);
            switch(key){
                case ':host':
                case ':initiator':
                    ctx.target = (<any>ctx)[key.substring(1)] as Element;
                    ctx.rhs = rhs;
                    delete(ctx.queryInfo);
                    await (<any>this)[verb](ctx);
                    continue;
            }
            const isDitto = key.startsWith("^");
            if(!isDitto){
                prevKey = key;
                queryInfo = getQuery(key);
                ctx.queryInfo = queryInfo;
                const {query, attrib, first} = queryInfo;
                const verbx = queryInfo.verb;
                let fromCache = matchMap[key];
                if(fromCache !== undefined){
                    fromCache = fromCache.filter(ref => {
                        const el = ref.deref();
                        if(el === undefined || !el.matches(query)) return false;
                        return true;
                    });
                    matchMap[key] = fromCache;
                }
                matches = [];
                if(isArray){
                    for(const el of fragment){
                        const elMatches = el.matches(query);
                        if(elMatches){
                            matches.push(el);
                            if(first) break;
                        }

                        const elMatches2 = (el as any)[verbx!](query);
                        switch(verbx){
                            case 'querySelector':
                                if(elMatches2 !== null) matches.push(elMatches2 as Element);
                                break;
                            default:
                                const arr = Array.from(elMatches2) as Element[];
                                //matches = matches.concat(arr);
                                arr.forEach((el: Element) => matches.push(el));
                        }
                        
                    }
                }else{
                    if(fromCache){
                        matches = fromCache;
                    }else{
                        switch(verbx){
                            case 'querySelector':
                                const el = (fragment as DocumentFragment).querySelector(query);
                                if(el !== null){
                                    matchMap[key] = [new WeakRef(el)];
                                }
                                break;
                            default:
                                matchMap[key] = Array.from((fragment as DocumentFragment).querySelectorAll(query)).map(el => new WeakRef(el));
                        }
                        matches = matchMap[key];
                       
                    }
                }
            }

            if(fragment instanceof Element){
                if(fragment.matches(queryInfo!.query)) {
                    matchMap[key].push(new WeakRef(fragment));
                    //if(matches !== matchMap[key]) matches.push(fragment);
                    //matches.push(fragment);
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
                switch(queryInfo!.match){
                    case 'A':
                        ctx.attrib = queryInfo!.attrib;
                        ctx.val = matchingElement.getAttribute(queryInfo!.attrib!);
                        break;
                    case 'N':
                        ctx.name = queryInfo!.attrib;
                        ctx.val = (matchingElement as HTMLFormElement).value;
                        break;
                    case 'D':
                        (<any>matchingElement)[lispToCamel(queryInfo!.attrib!)] = rhs;
                        continue;
                }
                await (<any>this)[verb](ctx);
            }
        }

        return ctx;
    }
    flushCache(){
        this.#queryCache = {};
    }
    async eval_string(){
        const {target, rhs, host}  = this.ctx;
        const {getVal} = await import('./getVal.js');
        return await getVal(this.ctx!, rhs);
    }
    getDefaultProp(target: any){
        if('href' in target) return 'href';
        if('value' in target) return 'value';
        return 'textContent'
    }
    async do_string({target}: RenderContext){
        const val = await this.eval_string();
        const prop = this.getDefaultProp(target);
        (target as any)[prop] = val;
    }
    do_number(){}
    do_boolean({target, rhs}: RenderContext){
        if(rhs === false) target!.remove();
    }
    async do_object(ctx: RenderContext){
        const {target, queryInfo, rhs} = ctx;
        const action = rhs.$action as string;
        if(action === undefined) throw 'NI';
        await (<any>this)['do_object_' + action](ctx);
    }

    async do_object_nested_transform(ctx: RenderContext){
        const {match, target} = ctx;
        this.ctx.match = {...ctx.rhs};
        await this.transform(target!);
        this.ctx.match = match;
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