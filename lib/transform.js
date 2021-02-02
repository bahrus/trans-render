import { getQuery } from './specialKeys.js';
import { lispToCamel } from './lispToCamel.js';
export function transform(sourceOrTemplate, ctx, target = sourceOrTemplate) {
    ctx.ctx = ctx;
    const isATemplate = isTemplate(sourceOrTemplate);
    const source = isATemplate
        ? sourceOrTemplate.content.cloneNode(true)
        : sourceOrTemplate;
    if (ctx.options?.cacheQueries) {
        if (ctx.queryCache === undefined)
            ctx.queryCache = new WeakMap();
    }
    processFragment(source, ctx);
    let verb = "appendChild";
    const options = ctx.options;
    if (options !== undefined) {
        if (options.prepend)
            verb = "prepend";
        const callback = options.initializedCallback;
        if (callback !== undefined)
            callback(ctx, source, options);
    }
    if (isATemplate && target) {
        target[verb](source);
    }
    ctx.mode = 'update';
    return ctx;
}
export function isTemplate(test) {
    return test !== undefined && test.localName === 'template' && test.content && (typeof test.content.cloneNode === 'function');
}
function processFragment(source, ctx) {
    const transf = ctx.match;
    if (transf === undefined)
        return;
    const transforms = Array.isArray(transf) ? transf : [transf];
    const isInit = ctx.mode === undefined;
    for (var transform of transforms) {
        const start = { level: 0, idx: 0 };
        if (isInit) {
            start.mode = 'init';
        }
        Object.assign(ctx, start);
        ctx.target = source;
        ctx.match = transform;
        processTarget(ctx);
    }
}
function processTarget(ctx) {
    const target = ctx.target;
    const tr = ctx.match;
    if (target == null || tr === undefined)
        return true;
    if (target.nodeType !== 11 && target.hasAttribute('debug'))
        debugger;
    const keys = Object.keys(tr);
    if (keys.length === 0)
        return true;
    const scopeKeys = [];
    for (const key of keys) {
        const queryInfo = getQuery(key);
        if (queryInfo !== null) {
            let matches;
            let qcLookup;
            const qc = ctx.queryCache;
            const query = queryInfo.query;
            if (qc !== undefined) {
                if (qc.has(target)) {
                    qcLookup = qc.get(target);
                    matches = qcLookup[query];
                } //else{
                //    qc.set(target, {});
                //}
            }
            if (matches === undefined) {
                matches = target.querySelectorAll(query);
                if (qc !== undefined) {
                    if (qcLookup !== undefined) {
                        qcLookup[query] = matches;
                    }
                    else {
                        qc.set(target, { [query]: matches });
                    }
                }
            }
            for (const match of matches) {
                const { val, target } = ctx;
                switch (queryInfo.type) {
                    case 'data':
                        ctx.val = match.getAttribute(queryInfo.attrib);
                        break;
                    case 'prop':
                        match[lispToCamel(queryInfo.attrib)] = tr[key];
                        continue;
                }
                ctx.target = match;
                doRHS(ctx, tr[key]);
                ctx.val = val;
                ctx.target = target;
            }
        }
        else {
            scopeKeys.push(key);
        }
    }
    for (const child of target.children) {
        for (const key of scopeKeys) {
            if (child.matches(key)) {
                ctx.target = child;
                doRHS(ctx, tr[key]);
                ctx.target = target;
            }
        }
    }
}
function doRHS(ctx, rhs) {
    if (rhs === undefined)
        return;
    while (typeof rhs === 'function')
        rhs = rhs(ctx);
    const pm = ctx.postMatch;
    if (pm !== undefined) {
        let ctor;
        switch (typeof rhs) {
            case 'string':
                ctor = pm.find(p => p.rhsType === String)?.ctor;
                break;
            case 'boolean':
                ctor = pm.find(p => p.rhsType === Boolean)?.ctor;
                break;
            case 'number':
                ctor = pm.find(p => p.rhsType === Number)?.ctor;
                break;
            case 'object':
                ctor = (Array.isArray(rhs) ? pm.find(p => p.rhsType === Array)?.ctor : undefined) ||
                    (isTemplate(rhs) ? pm.find(p => p.rhsType === HTMLTemplateElement)?.ctor : undefined) ||
                    pm.find(p => p.rhsType === Object)?.ctor;
                break;
            case 'bigint':
                ctor = pm.find(p => p.rhsType === BigInt)?.ctor;
                break;
            case 'symbol':
                ctor = pm.find(p => p.rhsType === Symbol)?.ctor;
                break;
        }
        switch (typeof ctor) {
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
