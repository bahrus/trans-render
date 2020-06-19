import { doObjectMatch } from './doObjectMatch.js';
const SkipSibs = Symbol();
const NextMatch = Symbol();
export function transform(sourceOrTemplate, ctx, target = sourceOrTemplate) {
    if (ctx.mode === undefined) {
        Object.assign(ctx, { mode: 'init', level: 0, idx: 0 });
    }
    const isTemplate = sourceOrTemplate.localName === "template";
    const source = isTemplate
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
    if (isTemplate && target) {
        target[verb](source);
    }
    ctx.mode = 'update';
}
export function copyCtx(ctx) {
    return Object.assign({}, ctx);
}
export function restoreCtx(ctx, originalCtx) {
    return (Object.assign(ctx, originalCtx));
}
function processFragment(source, ctx) {
    const transf = ctx.Transform;
    if (transf === undefined)
        return;
    for (const sym of Object.getOwnPropertySymbols(transf)) {
        const transformTemplateVal = transf[sym];
        const newTarget = (ctx[sym] || ctx.host[sym]);
        ctx.target = newTarget;
        switch (typeof (transformTemplateVal)) {
            case 'function':
                transformTemplateVal(ctx);
                break;
            case 'string':
                newTarget.textContent = transformTemplateVal;
                break;
        }
    }
    ctx.target = source.firstElementChild;
    processEl(ctx);
}
export function processEl(ctx) {
    const target = ctx.target;
    if (target == null || ctx.Transform === undefined)
        return true;
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
            if (key.startsWith('"')) {
                if (!matched)
                    continue;
            }
            else {
                if (!nextElementSibling.matches(key)) {
                    matched = false;
                    continue;
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
                    return true;
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
                    ctx.target = nextElementSibling;
                    doObjectMatch(key, tvo, ctx);
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
    const newTransform = nextStep.Transform;
    const mergedTransform = Object.assign({}, newTransform);
    if (ctx.previousTransform !== undefined && inherit) {
        Object.assign(mergedTransform, ctx.previousTransform);
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
                    return expr;
                case 'function':
                    const val = expr[0](ctx);
                    return getRHS([val, ...expr.slice(1)], ctx);
                case 'boolean':
                    return getRHS(pivot ? expr[1] : expr[2], ctx);
                case 'string':
                case 'symbol':
                    if (expr.length === 2 && typeof (expr[1]) === 'object') {
                        return getRHS(expr[1][pivot], ctx);
                    }
                    else {
                        throw '?';
                    }
            }
        case 'number':
            return expr.toString();
    }
}
