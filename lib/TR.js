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
        for (const key in match) {
            let rhs = match[key];
            const verb = 'do_' + typeof (rhs);
            if (key === ':host') {
                ctx.target = host;
                delete (ctx.queryInfo);
                await this[verb]();
                continue;
            }
            const queryInfo = getQuery(key);
            ctx.queryInfo = queryInfo;
            let fromCache = matchMap[key];
            if (fromCache !== undefined) {
                fromCache = fromCache.filter(ref => {
                    const el = ref.deref();
                    if (el === undefined || !el.matches(queryInfo.query))
                        return false;
                    return true;
                });
                matchMap[key] = fromCache;
            }
            let matches = isArray ?
                fragment.filter(x => x.matches(queryInfo.query))
                : fromCache || (matchMap[key] = Array.from(fragment.querySelectorAll(queryInfo.query)).map(el => new WeakRef(el)));
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
                await this[verb]();
            }
        }
        return ctx;
    }
    flushCache() {
        this.#queryCache = new WeakMap();
    }
    async do_string() {
        const { target, rhs, host } = this.ctx;
        target.textContent = rhs === '.' ? host : host[rhs];
    }
    do_number() { }
    do_boolean() {
        const { target, rhs } = this.ctx;
        if (rhs === false)
            target.remove();
    }
    async do_object() {
        const { target, rhs, host, match, queryInfo } = this.ctx;
        const lhsProp = queryInfo?.lhsProp;
        if (lhsProp) {
            target[lhsProp] = rhs;
        }
        else {
            this.ctx.match = { ...match, ...rhs };
            await this.transform(target);
            this.ctx.match = match;
        }
    }
    do_function() {
        const ctx = this.ctx;
        const rhs = ctx.rhs(ctx);
        if (rhs === undefined)
            return;
        ctx.rhs = rhs;
        const verb = 'do_' + typeof (rhs);
        this[verb]();
    }
    isTemplate(sourceOrTemplate) {
        return sourceOrTemplate.localName === 'template';
    }
}
