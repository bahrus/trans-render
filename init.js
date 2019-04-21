export function init(template, ctx, target, options) {
    const isTemplate = template.localName === "template";
    const clonedTemplate = isTemplate
        ? document.importNode(template.content, true) : template;
    //ctx.template = clonedTemplate;
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
    if (isTemplate) {
        target[verb](clonedTemplate);
    }
    return ctx;
}
export function process(context, idx, level, options) {
    const target = context.leaf;
    if (target.matches === undefined)
        return;
    const transform = context.Transform;
    let nextTransform = {};
    let nextSelector = "";
    let firstSelector = true;
    let matchNextSib = true;
    let inherit = false;
    let nextMatch = [];
    for (const selector in transform) {
        if (target.matches(selector)) {
            const transformTemplateVal = transform[selector];
            let resp2 = transformTemplateVal;
            if (typeof resp2 === 'function') {
                resp2 = resp2({ target: target, ctx: context, idx: idx, level: level });
            }
            switch (typeof resp2) {
                case "string":
                    target.textContent = resp2;
                    break;
                case "object":
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
                    else if (resp2.localName === 'template') {
                        const templ = resp2;
                        target.appendChild(document.importNode(templ, true));
                    }
                    else {
                        const respAsNextStep = resp2;
                        inherit = inherit || !!respAsNextStep.MergeTransforms;
                        if (respAsNextStep.Select !== undefined) {
                            nextSelector =
                                (firstSelector ? "" : ",") + respAsNextStep.Select;
                            firstSelector = false;
                        }
                        const newTransform = respAsNextStep.Transform;
                        if (newTransform === undefined) {
                            Object.assign(nextTransform, context.Transform);
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
                    break;
            }
        }
    }
    if (matchNextSib) {
        let transform = context.Transform;
        const nextSib = target.nextElementSibling;
        if (nextSib !== null) {
            context.leaf = nextSib;
            process(context, idx + 1, level, options);
        }
        context.Transform = transform;
        if (nextMatch.length > 0) {
            const match = nextMatch.join(",");
            let nextSib = target.nextElementSibling;
            while (nextSib !== null) {
                if (nextSib.matches(match)) {
                    context.leaf = nextSib;
                    process(context, idx + 1, level, options);
                    break;
                }
                nextSib = nextSib.nextElementSibling;
            }
        }
    }
    if (nextSelector.length > 0) {
        let transform = context.Transform;
        const nextChild = target.querySelector(nextSelector);
        if (inherit) {
            Object.assign(nextTransform, context.Transform);
        }
        if (nextChild !== null) {
            context.leaf = nextChild;
            context.Transform = nextTransform;
            process(context, 0, level + 1, options);
            context.Transform = transform;
        }
    }
}
