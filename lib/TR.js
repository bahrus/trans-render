import { getQuery } from './specialKeys.js';
import { lispToCamel } from './lispToCamel.js';
export class TR {
    ctx;
    #queryCache = new WeakMap();
    static async transform(sourceOrTemplate, ctx, target = sourceOrTemplate) {
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
        return new TR(ctx);
    }
    constructor(ctx) {
        this.ctx = ctx;
    }
    async transform(fragment) {
        const { ctx } = this;
        const { host, options, match } = ctx;
        const qc = this.#queryCache;
        if (!qc.has(fragment)) {
            qc.set(fragment, {});
        }
        const matchMap = qc.get(fragment);
        for (const key in match) {
            let rhs = match[key];
            const verb = 'do_' + typeof (rhs);
            if (key === ':host') {
                ctx.target = host;
                await this[verb]();
                continue;
            }
            const queryInfo = getQuery(key);
            let matches = matchMap[key] || (matchMap[key] = fragment.querySelectorAll(queryInfo.query));
            ctx.rhs = rhs;
            for (const match of matches) {
                ctx.target = match;
                switch (queryInfo.type) {
                    case 'attribs':
                        ctx.attrib = queryInfo.attrib;
                        ctx.val = match.getAttribute(queryInfo.attrib);
                        break;
                    case 'props':
                        match[lispToCamel(queryInfo.attrib)] = rhs;
                        continue;
                }
                await this[verb]();
            }
        }
        return ctx;
    }
    async do_string() {
        const { target, rhs, host } = this.ctx;
        target.textContent = host[rhs];
    }
    do_number() { }
    do_boolean() {
        const { target, rhs } = this.ctx;
        if (rhs === false)
            target.remove();
    }
    async do_object() {
        const { target, rhs, host, match } = this.ctx;
        this.ctx.match = { ...match, ...rhs };
        await this.transform(target);
        this.ctx.match = match;
    }
    do_function() {
        const ctx = this.ctx;
        ctx.rhs = ctx.rhs(ctx);
        const verb = 'do_' + typeof (ctx.rhs);
        this[verb]();
    }
    isTemplate(sourceOrTemplate) {
        return sourceOrTemplate.localName === 'template';
    }
}
