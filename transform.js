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
    if (ctx.Transform !== undefined) {
        processFragment(source, ctx);
    }
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
    return ctx;
}
function copyCtx(ctx) {
    return Object.assign({}, ctx);
}
function restoreCtx(ctx, originalCtx) {
    return (Object.assign(ctx, originalCtx));
}
function processFragment(source, ctx) {
    for (const sym of Object.getOwnPropertySymbols(transform)) {
        const transformTemplateVal = transform[sym];
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
        doNextStepSelect(ctx);
        doNextStepSibling(ctx);
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
                    break;
                case 'symbol':
                    const cache = ctx.host || ctx;
                    cache[tvo] = nextElementSibling;
                case 'undefined':
                    continue;
            }
        }
        const elementToRemove = removeNextElementSibling ? nextElementSibling : undefined;
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
}
function doObjectMatch(key, tvoo, ctx) {
    if (Array.isArray(tvoo)) {
        doArrayMatch(key, tvoo, ctx);
    }
    else {
        if (isTemplate(tvoo)) {
            doTemplate(ctx, tvoo);
        }
        else {
            const ctxCopy = copyCtx(ctx);
            ctx.Transform = tvoo; //TODO -- don't do this line if this is a property setting
            const keys = Object.keys(tvoo);
            const firstCharOfFirstProp = keys[0][0];
            let isNextStep = "SNTM".indexOf(firstCharOfFirstProp) > -1;
            if (isNextStep) {
                doNextStepSelect(ctx);
                doNextStepSibling(ctx);
            }
            else {
                ctx.target = ctx.target.firstElementChild;
                ctx.level++;
                ctx.idx = 0;
                ctx.previousTransform = ctx.Transform;
                processEl(ctx);
            }
            restoreCtx(ctx, ctxCopy);
        }
    }
}
function isTemplate(test) {
    return test.localName === 'template' && test.content && (typeof test.content.cloneNode === 'function');
}
function doTemplate(ctx, te) {
    const clone = te.content.cloneNode(true);
    if (te.dataset.shadowRoot !== undefined) {
        ctx.target.attachShadow({ mode: te.dataset.shadowRoot, delegatesFocus: true }).appendChild(clone);
    }
    else {
        ctx.target.appendChild(clone);
    }
}
function doArrayMatch(key, tvao, ctx) {
    const firstEl = tvao[0];
    switch (typeof firstEl) {
        case 'undefined':
        case 'object':
            if (Array.isArray(firstEl)) {
                doRepeat(key, tvao, ctx);
            }
            else {
                doPropSetting(key, tvao, ctx);
            }
            break;
    }
}
function doPropSetting(key, peat, ctx) {
    const len = peat.length;
    const target = ctx.target;
    if (len > 0) {
        //////////  Prop Setting
        /////////   Because of dataset, style (other?) assign at one level down
        const props = peat[0];
        if (props !== undefined) {
            Object.assign(target, props);
            if (props.style !== undefined)
                Object.assign(target.style, props.style);
            if (props.dataset !== undefined)
                Object.assign(target.dataset, props.dataset);
        }
    }
    if (len > 1 && peat[1] !== undefined) {
        /////////  Event Handling
        const eventSettings = peat[1];
        for (const key in eventSettings) {
            let eventHandler = eventSettings[key];
            if (Array.isArray(eventHandler)) {
                const objSelectorPath = eventHandler[1].split('.');
                const converter = eventHandler[2];
                const originalEventHandler = ctx.host !== undefined ? eventHandler[0].bind(ctx.host) : eventHandler[0];
                eventHandler = (e) => {
                    let val = getProp(e.target, objSelectorPath);
                    if (converter !== undefined)
                        val = converter(val);
                    originalEventHandler(val, e);
                };
            }
            else if (ctx.host !== undefined) {
                eventHandler = eventHandler.bind(ctx.host);
            }
            target.addEventListener(key, eventHandler);
        }
    }
    if (len > 2 && peat[2] !== undefined) {
        /////////  Attribute Setting
        for (const key in peat[2]) {
            const val = peat[2][key];
            switch (typeof val) {
                case 'boolean':
                    if (val) {
                        target.setAttribute(key, '');
                    }
                    else {
                        target.removeAttribute(key);
                    }
                    break;
                case 'string':
                    target.setAttribute(key, val);
                    break;
                case 'number':
                    target.setAttribute(key, val.toString());
                    break;
                case 'object':
                    if (val === null)
                        target.removeAttribute(key);
                    break;
            }
        }
    }
}
async function doRepeat(key, atriums, ctx) {
    const { repeateth } = await import('./repeateth2.js');
    repeateth(atriums[1], ctx, atriums[0], ctx.target, atriums[3], atriums[4]);
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
function doNextStepSelect(ctx) {
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
function doNextStepSibling(ctx) {
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
