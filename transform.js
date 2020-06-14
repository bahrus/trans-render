export function transform(sourceOrTemplate, ctx, target = sourceOrTemplate, options) {
    ctx.level = 0;
    ctx.idx = 0;
    ctx.options = options;
    const isTemplate = sourceOrTemplate.localName === "template";
    const source = isTemplate
        ? sourceOrTemplate.content.cloneNode(true)
        : sourceOrTemplate;
    if (ctx.Transform !== undefined) {
        processFragment(source, ctx);
    }
    let verb = "appendChild";
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
    return ctx;
}
function copyCtx(ctx) {
    return Object.assign({}, ctx);
}
function restoreCtx(ctx, originalCtx) {
    return (Object.assign(ctx, originalCtx));
}
function processFragment(source, ctx) {
    // for(const sym of Object.getOwnPropertySymbols(transform) ) {
    //     const transformTemplateVal = (<any>transform)[sym];
    //     const newTarget = ((<any>ctx)[sym] || (<any>ctx).host![sym]) as HTMLElement;
    //     switch(typeof(transformTemplateVal)){
    //       case 'function':
    //         transformTemplateVal({target: newTarget, ctx, idx, level, undefined});
    //         break;
    //       case 'string':
    //         newTarget.textContent = transformTemplateVal;
    //         break;
    //     }
    // }
    ctx.target = source.firstElementChild;
    processEl(ctx);
}
function processEl(ctx) {
    const target = ctx.target;
    if (target == null)
        return;
    const keys = Object.keys(ctx.Transform);
    if (keys.length === 0)
        return;
    const firstCharOfFirstProp = keys[0][0];
    let isNextStep = "SNTM".indexOf(firstCharOfFirstProp) > -1;
    if (isNextStep) {
        doNextStep(ctx);
        return;
    }
    let nextElementSibling = target;
    const tm = ctx.Transform;
    let matched = false;
    while (nextElementSibling !== null) {
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
            const tvo = getRHS(tm[key], ctx);
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
                case 'undefined':
                    continue;
            }
        }
        const elementToRemove = removeNextElementSibling ? nextElementSibling : undefined;
        nextElementSibling = nextElementSibling.nextElementSibling;
        if (elementToRemove !== undefined)
            elementToRemove.remove();
    }
}
function doObjectMatch(key, tvoo, ctx) {
    if (Array.isArray(tvoo)) {
        doArrayMatch(key, tvoo);
    }
    else {
        if (isTemplate(tvoo)) {
            doTemplate(ctx, tvoo);
        }
        else {
            const ctxCopy = copyCtx(ctx);
            ctx.target = ctx.target.firstElementChild;
            ctx.level++;
            ctx.idx = 0;
            ctx.previousTransform = ctx.Transform;
            ctx.Transform = tvoo;
            processEl(ctx);
            restoreCtx(ctx, ctxCopy);
        }
    }
}
function isTemplate(test) {
    return test.localName === 'template' && test.content && (typeof test.content.cloneNode === 'function');
}
function doTemplate(ctx, te) {
    ctx.target.appendChild(te.content.cloneNode(true));
}
function doPropSetting(key, tm, ctx) {
}
function doArrayMatch(key, tvao) {
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
function doNextStep(ctx) {
    const nextStep = ctx.Transform;
    let nextEl;
    if (nextStep.Select !== undefined) {
        nextEl = ctx.target.querySelector(nextStep.Select);
    }
    else if (nextStep.NextMatch !== undefined) {
        nextEl = closestNextSib(ctx.target, nextStep.NextMatch);
    }
    else {
        throw ('?');
    }
    if (nextEl === null)
        return;
    const inherit = !!nextStep.MergeTransforms;
    const newTransform = nextStep.Transform;
    const mergedTransform = Object.assign({}, newTransform);
    if (ctx.previousTransform !== undefined && inherit) {
        Object.assign(mergedTransform, ctx.previousTransform);
    }
    ctx.Transform = mergedTransform;
    ctx.target = nextEl;
    processEl(ctx);
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
