import { getQuery } from './specialKeys.js';
import { lispToCamel } from './lispToCamel.js';
export class TR {
    ctx;
    #queryCache = new WeakMap();
    static async transform(sourceOrTemplate, ctx, target) {
        const tr = this.new(ctx);
        const isATemplate = tr.isTemplate(sourceOrTemplate);
        const source = isATemplate
            ? sourceOrTemplate.content.cloneNode(true)
            : sourceOrTemplate;
        await tr.transform(source);
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
    async transform(fragment) {
        const { ctx } = this;
        const { host, options, match } = ctx;
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
            //const theKey = prevKey !== undefined && isDitto ? prevKey : key;
            if (!isDitto) {
                prevKey = key;
                queryInfo = getQuery(key);
                ctx.queryInfo = queryInfo;
                const { query } = queryInfo;
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
                if (isArray) {
                    for (const el of fragment) {
                        if (el.matches(query)) {
                            matches.push(el);
                        }
                        el.querySelectorAll(query).forEach(el => matches.push(el));
                    }
                }
                else {
                    matches = fromCache || (matchMap[key] = Array.from(fragment.querySelectorAll(query)).map(el => new WeakRef(el)));
                }
            }
            // let matches = (isArray ? 
            //                         (fragment as Element[]).filter(x => x.matches(query)) 
            //                       : fromCache || ;
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
                switch (queryInfo.type) {
                    case 'attribs':
                        ctx.attrib = queryInfo.attrib;
                        ctx.val = matchingElement.getAttribute(queryInfo.attrib);
                        break;
                    case 'props':
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
