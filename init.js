const stcRe = /(\-\w)/g;
export function lispToCamel(s) {
    return s.replace(stcRe, function (m) { return m[1].toUpperCase(); });
}
export function init(template, ctx, target, options) {
    const isTemplate = template.localName === "template";
    const clonedTemplate = isTemplate
        ? document.importNode(template.content, true)
        : template;
    if (ctx.Transform) {
        const firstChild = clonedTemplate.firstElementChild;
        if (firstChild !== null) {
            ctx.leaf = firstChild;
            process(ctx, 0, 0, options);
        }
    }
    let verb = "appendChild";
    if (options) {
        if (options.prepend)
            verb = "prepend";
        const callback = options.initializedCallback;
        if (callback !== undefined)
            callback(ctx, clonedTemplate, options);
    }
    if (isTemplate && target) {
        target[verb](clonedTemplate);
    }
    else {
        ctx.leaf = clonedTemplate;
    }
    return ctx;
}
export function process(ctx, idx, level, options) {
    const target = ctx.leaf;
    if (target.matches === undefined)
        return;
    const transform = ctx.Transform;
    let nextTransform = {};
    let nextSelector = "";
    let firstSelector = true;
    let matchNextSib = true;
    let inherit = false;
    let nextMatch = [];
    let prevSelector = null;
    for (const sym of Object.getOwnPropertySymbols(transform)) {
        const transformTemplateVal = transform[sym]; // as TransformValueOptions<HTMLElement>;
        if (typeof transformTemplateVal === 'function') {
            const item = undefined;
            transformTemplateVal({ target: (ctx[sym] || ctx.host[sym]), ctx, idx, level, item });
        }
    }
    for (const rawSelector in transform) {
        let selector;
        if (prevSelector !== null && rawSelector.startsWith('"')) {
            selector = prevSelector;
        }
        else {
            selector = rawSelector;
            prevSelector = selector;
        }
        if (target.matches(selector)) {
            const transformTemplateVal = transform[rawSelector];
            let resp2 = transformTemplateVal;
            if (typeof resp2 === "function") {
                const item = ctx.itemsKey !== undefined ? target[ctx.itemsKey] : undefined;
                resp2 = resp2({ target, ctx, idx, level, item });
            }
            switch (typeof resp2) {
                case "string":
                    target.textContent = resp2;
                    continue;
                case "object":
                    if (selector.endsWith(']')) {
                        //TODO use named capture group reg expression
                        const pos = selector.lastIndexOf('[');
                        if (pos > -1 && selector[pos + 1] === '-') {
                            /* scenario:
                              'my-custom-element[-my-prop]':{
                                  subProp1: 'hello',
                                  subProp2: 'world'
                              }
                            */
                            const propName = lispToCamel(selector.substring(pos + 2, selector.length - 1));
                            target[propName] = resp2;
                            continue;
                        }
                    }
                    if (Array.isArray(resp2)) {
                        const peat = resp2;
                        applyPeatSettings(target, peat, ctx);
                        const len = peat.length;
                        if (len > 3) {
                            if (peat[3] !== undefined)
                                resp2 = peat[3];
                            if (len > 4) {
                                (ctx.host || ctx)[peat[4]] = target;
                            }
                        }
                        else {
                            continue;
                        }
                    }
                    if (isTemplate(resp2)) {
                        const templ = resp2;
                        const clone = templ.content.cloneNode(true);
                        if (templ.dataset.shadowRoot !== undefined) {
                            target.attachShadow({ mode: templ.dataset.shadowRoot, delegatesFocus: true }).appendChild(clone);
                        }
                        else {
                            target.appendChild(clone);
                        }
                    }
                    else {
                        let isTR = true;
                        const keys = Object.keys(resp2);
                        if (keys.length > 0) {
                            const firstCharOfFirstProp = keys[0][0];
                            isTR = "SNTM".indexOf(firstCharOfFirstProp) === -1;
                        }
                        if (isTR) {
                            const respAsTransformRules = resp2;
                            nextSelector = "*";
                            Object.assign(nextTransform, respAsTransformRules);
                        }
                        else {
                            const respAsNextStep = resp2;
                            inherit = inherit || !!respAsNextStep.MergeTransforms;
                            if (respAsNextStep.Select !== undefined) {
                                nextSelector +=
                                    (firstSelector ? "" : ",") + respAsNextStep.Select;
                                firstSelector = false;
                            }
                            const newTransform = respAsNextStep.Transform;
                            if (newTransform === undefined) {
                                Object.assign(nextTransform, ctx.Transform);
                            }
                            else {
                                Object.assign(nextTransform, newTransform);
                            }
                            if (respAsNextStep.SkipSibs)
                                matchNextSib = false;
                            if (!matchNextSib && respAsNextStep.NextMatch) {
                                nextMatch.push(respAsNextStep.NextMatch);
                            }
                        }
                    }
                    break;
                case "boolean":
                    if (resp2 === false)
                        target.dataset.deleteMe = 'true';
                    break;
                case "symbol":
                    const cache = ctx.host || ctx;
                    cache[resp2] = target;
                    break;
            }
        }
    }
    if (matchNextSib) {
        let transform = ctx.Transform;
        const nextSib = target.nextElementSibling;
        if (nextSib !== null) {
            ctx.leaf = nextSib;
            process(ctx, idx + 1, level, options);
        }
        ctx.Transform = transform;
    }
    else if (nextMatch.length > 0) {
        const match = nextMatch.join(",");
        let nextSib = target.nextElementSibling;
        while (nextSib !== null) {
            if (nextSib.matches(match)) {
                ctx.leaf = nextSib;
                process(ctx, idx + 1, level, options);
                break;
            }
            nextSib = nextSib.nextElementSibling;
        }
    }
    if (nextSelector.length > 0) {
        let transform = ctx.Transform;
        const nextChild = target.querySelector(nextSelector);
        if (inherit) {
            Object.assign(nextTransform, ctx.Transform);
        }
        if (nextChild !== null) {
            ctx.leaf = nextChild;
            ctx.Transform = nextTransform;
            process(ctx, 0, level + 1, options);
            ctx.Transform = transform;
        }
    }
    if (target.dataset.deleteMe !== undefined)
        target.remove();
}
function isTemplate(test) {
    return test.localName === 'template' && test.content && (typeof test.content.cloneNode === 'function');
}
export function applyPeatSettings(target, peat, ctx) {
    const len = peat.length;
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
        for (const key in peat[1]) {
            let eventHandler = peat[1][key];
            if (ctx.host !== undefined)
                eventHandler = eventHandler.bind(ctx.host);
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
