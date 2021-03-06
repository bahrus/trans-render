const SkipSibs = Symbol();
const NextMatch = Symbol();
export const more = Symbol.for('e35fe6cb-78d4-48fe-90f8-bf9da743d532');
export function transform(sourceOrTemplate, ctx, target = sourceOrTemplate) {
    ctx.ctx = ctx;
    const isATemplate = isTemplate(sourceOrTemplate);
    const source = isATemplate
        ? sourceOrTemplate.content.cloneNode(true)
        : sourceOrTemplate;
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
export function copyCtx(ctx) {
    return Object.assign({}, ctx);
}
export function restoreCtx(ctx, originalCtx) {
    return (Object.assign(ctx, originalCtx));
}
export function processFragment(source, ctx) {
    const transf = ctx.Transform;
    if (transf === undefined)
        return;
    const transforms = Array.isArray(transf) ? transf : [transf];
    const isInit = ctx.mode === undefined;
    transforms.forEach(transform => {
        const start = { level: 0, idx: 0 };
        if (isInit) {
            start.mode = 'init';
        }
        Object.assign(ctx, start);
        ctx.target = source.firstElementChild;
        ctx.Transform = transform;
        processEl(ctx);
        processSymbols(ctx);
    });
}
export function processSymbols(ctx) {
    const transf = ctx.Transform;
    for (const sym of Object.getOwnPropertySymbols(transf)) {
        let transformTemplateVal = transf[sym];
        if (sym === more) {
            ctx.Transform = transformTemplateVal;
            processSymbols(ctx);
            ctx.Transform = transf;
        }
        const newTarget = (ctx[sym] || ctx.host[sym]);
        if (newTarget === undefined)
            continue;
        ctx.target = newTarget;
        while (typeof transformTemplateVal === 'function') {
            transformTemplateVal = transformTemplateVal(ctx);
        }
        switch (typeof (transformTemplateVal)) {
            case 'string':
                newTarget.textContent = transformTemplateVal;
                break;
            case 'object':
                ctx.customObjProcessor('', transformTemplateVal, ctx);
                break;
            case 'boolean':
                if (transformTemplateVal === false)
                    newTarget.remove();
        }
    }
}
export function processEl(ctx) {
    const target = ctx.target;
    if (target == null || ctx.Transform === undefined)
        return true;
    if (target.hasAttribute('debug'))
        debugger;
    const keys = Object.keys(ctx.Transform);
    if (keys.length === 0)
        return true;
    const firstCharOfFirstProp = keys[0][0];
    let isNextStep = "SNTM".indexOf(firstCharOfFirstProp) > -1;
    if (isNextStep) {
        doNextStepSelect(ctx);
        doNextStepSibling(ctx);
    }
    let nextElementSibling = target;
    const tm = ctx.Transform;
    let matched = false;
    while (nextElementSibling !== null) {
        if (ctx.itemTagger !== undefined)
            ctx.itemTagger(nextElementSibling);
        let removeNextElementSibling = false;
        for (let i = 0, ii = keys.length; i < ii; i++) {
            const key = keys[i];
            if (key === 'debug') {
                debugger;
                continue;
            }
            if (key.startsWith('"')) {
                if (!matched)
                    continue;
            }
            else {
                let modifiedSelector = key;
                if (key === ':host') {
                    if (nextElementSibling !== ctx.host) {
                        matched = false;
                    }
                }
                else if (key.startsWith(':has(>')) {
                    const query = key.substring(6, key.length - 1);
                    let foundMatch = false;
                    for (let i = 0, ii = nextElementSibling.children.length; i < ii; i++) {
                        const el = nextElementSibling.children[i];
                        if (el.matches(query)) {
                            foundMatch = true;
                            break;
                        }
                    }
                    if (!foundMatch) {
                        matched = false;
                        continue;
                    }
                }
                else {
                    if (key.endsWith('Part')) {
                        modifiedSelector = `[part="${key.substring(0, key.length - 4)}"]`;
                    }
                    if (!nextElementSibling.matches(modifiedSelector)) {
                        matched = false;
                        continue;
                    }
                }
            }
            matched = true;
            ctx.target = nextElementSibling;
            const tvo = getRHS(tm[key], ctx);
            if (key.endsWith(']')) {
                //TODO use named capture group reg expression
                const pos = key.lastIndexOf('[');
                if (pos > -1 && key[pos + 1] === '-') {
                    const propName = lispToCamel(key.substring(pos + 2, key.length - 1));
                    nextElementSibling[propName] = tvo;
                    continue;
                }
            }
            switch (typeof tvo) {
                case 'string':
                    nextElementSibling.textContent = tvo;
                    break;
                case 'boolean':
                    if (tvo === false)
                        removeNextElementSibling = true;
                    break;
                case 'object':
                    if (tvo === null)
                        continue;
                    ctx.customObjProcessor(key, tvo, ctx);
                    break;
                case 'symbol':
                    const cache = ctx.host || ctx;
                    cache[tvo] = nextElementSibling;
                case 'undefined':
                    continue;
            }
        }
        const elementToRemove = (removeNextElementSibling || nextElementSibling.dataset.deleteMe === 'true') ?
            nextElementSibling : undefined;
        const nextMatch = nextElementSibling[NextMatch];
        const prevEl = nextElementSibling;
        if (prevEl[SkipSibs]) {
            nextElementSibling = null;
        }
        else if (nextMatch !== undefined) {
            nextElementSibling = closestNextSib(nextElementSibling, nextMatch);
        }
        else {
            nextElementSibling = nextElementSibling.nextElementSibling;
        }
        prevEl[SkipSibs] = false;
        prevEl[NextMatch] = undefined;
        if (elementToRemove !== undefined)
            elementToRemove.remove();
    }
    return true;
}
const stcRe = /(\-\w)/g;
export function lispToCamel(s) {
    return s.replace(stcRe, function (m) { return m[1].toUpperCase(); });
}
export function getProp(val, pathTokens) {
    let context = val;
    for (const token of pathTokens) {
        context = context[token];
        if (context === undefined)
            break;
    }
    return context;
}
function closestNextSib(target, match) {
    let nextElementSibling = target.nextElementSibling;
    while (nextElementSibling !== null) {
        if (nextElementSibling.matches(match))
            return nextElementSibling;
        nextElementSibling = nextElementSibling.nextElementSibling;
    }
    return null;
}
export function doNextStepSelect(ctx) {
    const nextStep = ctx.Transform;
    if (nextStep.Select === undefined)
        return;
    let nextEl = ctx.target.querySelector(nextStep.Select);
    if (nextEl === null)
        return;
    const inherit = !!nextStep.MergeTransforms;
    let mergedTransform = nextStep.Transform || ctx.previousTransform;
    if (inherit && nextStep.Transform) {
        const newTransform = nextStep.Transform;
        mergedTransform = Object.assign({}, newTransform);
        if (ctx.previousTransform !== undefined && inherit) {
            Object.assign(mergedTransform, ctx.previousTransform);
        }
    }
    const copy = copyCtx(ctx);
    ctx.Transform = mergedTransform;
    ctx.target = nextEl;
    processEl(ctx);
    restoreCtx(ctx, copy);
}
export function doNextStepSibling(ctx) {
    const nextStep = ctx.Transform;
    const aTarget = ctx.target;
    (aTarget)[SkipSibs] = nextStep.SkipSibs || (aTarget)[SkipSibs];
    aTarget[NextMatch] = (aTarget[NextMatch] === undefined) ? nextStep.NextMatch : aTarget[NextMatch] + ', ' + nextStep.NextMatch;
}
function getRHS(expr, ctx) {
    switch (typeof expr) {
        case 'undefined':
        case 'string':
        case 'symbol':
        case 'boolean':
            return expr;
        case 'function':
            return getRHS(expr(ctx), ctx);
        case 'object':
            if (expr === null)
                return expr;
            if (!Array.isArray(expr) || expr.length === 0)
                return expr;
            const pivot = expr[0];
            switch (typeof pivot) {
                case 'object':
                case 'undefined':
                case 'string':
                    return expr;
                case 'function':
                    const val = expr[0](ctx);
                    return getRHS([val, ...expr.slice(1)], ctx);
                case 'boolean':
                    if (isTemplate(expr[1]))
                        return expr;
                    return getRHS(pivot ? expr[1] : expr[2], ctx);
                case 'symbol':
                    return ctx[pivot].fn(ctx, expr);
            }
        case 'number':
            return expr.toString();
    }
}
