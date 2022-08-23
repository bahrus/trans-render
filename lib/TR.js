import { getQuery } from './specialKeys.js';
import { lispToCamel } from './lispToCamel.js';
export class TR {
    ctx;
    #queryCache = new WeakMap();
    #tsChecker;
    static async transform(sourceOrTemplate, ctx, target, fragmentManager) {
        const tr = this.new(ctx);
        const isATemplate = tr.isTemplate(sourceOrTemplate);
        const source = isATemplate
            ? sourceOrTemplate.content.cloneNode(true)
            : sourceOrTemplate;
        await tr.transform(source, fragmentManager);
        let verb = "appendChild";
        const { options } = ctx;
        if (options !== undefined) {
            if (options.prepend)
                verb = "prepend";
        }
        if (isATemplate && target) {
            target[verb](source);
        }
        return tr;
    }
    static new(ctx) {
        ctx.ctx = ctx;
        return new TR(ctx);
    }
    constructor(ctx) {
        this.ctx = ctx;
        if (ctx.ctx === undefined)
            ctx.ctx = ctx;
    }
    async transform(fragment, fragmentManager) {
        const { ctx } = this;
        const { host, options, match, timestampKey } = ctx;
        if (host !== undefined && timestampKey) {
            if (this.#tsChecker === undefined) {
                const { TSChecker } = await import('./tsChecker.js');
                this.#tsChecker = new TSChecker(timestampKey);
            }
            const elementKey = fragmentManager ? fragmentManager : fragment;
            if (this.#tsChecker.notChanged(host, elementKey))
                return ctx;
        }
        const qc = this.#queryCache;
        const isArray = Array.isArray(fragment);
        if (!isArray && !qc.has(fragment)) {
            qc.set(fragment, {});
        }
        const matchMap = isArray ? {} : qc.get(fragment);
        let prevKey = undefined;
        let queryInfo;
        let matches = [];
        for (const key in match) {
            let rhs = match[key];
            const verb = 'do_' + typeof (rhs);
            if (key === ':host') {
                ctx.target = host;
                ctx.rhs = rhs;
                delete (ctx.queryInfo);
                await this[verb](ctx);
                continue;
            }
            const isDitto = key.startsWith("^");
            if (!isDitto) {
                prevKey = key;
                queryInfo = getQuery(key);
                ctx.queryInfo = queryInfo;
                const { query, attrib, first } = queryInfo;
                const verbx = queryInfo.verb;
                let fromCache = matchMap[key];
                if (fromCache !== undefined) {
                    fromCache = fromCache.filter(ref => {
                        const el = ref.deref();
                        if (el === undefined || !el.matches(query))
                            return false;
                        return true;
                    });
                    matchMap[key] = fromCache;
                }
                matches = [];
                if (isArray) {
                    for (const el of fragment) {
                        const elMatches = el.matches(query);
                        if (elMatches) {
                            matches.push(el);
                            if (first)
                                break;
                        }
                        const elMatches2 = el[verbx](query);
                        switch (verbx) {
                            case 'querySelector':
                                if (elMatches2 !== null)
                                    matches.push(elMatches2);
                                break;
                            default:
                                const arr = Array.from(elMatches2);
                                //matches = matches.concat(arr);
                                arr.forEach((el) => matches.push(el));
                        }
                    }
                }
                else {
                    if (fromCache) {
                        matches = fromCache;
                    }
                    else {
                        switch (verbx) {
                            case 'querySelector':
                                const el = fragment.querySelector(query);
                                if (el !== null) {
                                    matchMap[key] = [new WeakRef(el)];
                                }
                                break;
                            default:
                                matchMap[key] = Array.from(fragment.querySelectorAll(query)).map(el => new WeakRef(el));
                        }
                        matches = matchMap[key];
                    }
                }
            }
            if (fragment instanceof Element) {
                if (fragment.matches(queryInfo.query)) {
                    matchMap[key].push(new WeakRef(fragment));
                    matches.push(fragment);
                }
            }
            if (rhs === true) {
                host[key] = matches;
                continue;
            }
            ctx.rhs = rhs;
            for (const el of matches) {
                const matchingElement = el instanceof Element ? el : el.deref();
                ctx.target = matchingElement;
                switch (queryInfo.match) {
                    case 'A':
                        ctx.attrib = queryInfo.attrib;
                        ctx.val = matchingElement.getAttribute(queryInfo.attrib);
                        break;
                    case 'N':
                        ctx.name = queryInfo.attrib;
                        ctx.val = matchingElement.value;
                        break;
                    case 'D':
                        matchingElement[lispToCamel(queryInfo.attrib)] = rhs;
                        continue;
                }
                await this[verb](ctx);
            }
        }
        return ctx;
    }
    flushCache() {
        this.#queryCache = new WeakMap();
    }
    async eval_string() {
        const { target, rhs, host } = this.ctx;
        const { getVal } = await import('./getVal.js');
        return await getVal(host, rhs);
    }
    async do_string({ target }) {
        const val = await this.eval_string();
        target.textContent = val;
    }
    do_number() { }
    do_boolean({ target, rhs }) {
        if (rhs === false)
            target.remove();
    }
    async do_object(ctx) {
        const { target, queryInfo, rhs } = ctx;
        const lhsProp = queryInfo?.lhsProp;
        if (lhsProp) {
            target[lhsProp] = rhs;
        }
        else {
            const action = rhs.$action;
            if (action === undefined)
                throw 'NI';
            await this['do_object_' + action](ctx);
        }
    }
    async do_object_nested_transform(ctx) {
        const { match, target } = ctx;
        this.ctx.match = { ...ctx.rhs };
        await this.transform(target);
        this.ctx.match = match;
    }
    async do_function() {
        const ctx = this.ctx;
        const rhs = ctx.rhs(ctx);
        if (rhs === undefined)
            return;
        ctx.rhs = rhs;
        const verb = 'do_' + typeof (rhs);
        await this[verb](ctx);
    }
    isTemplate(sourceOrTemplate) {
        return sourceOrTemplate.localName === 'template';
    }
}
