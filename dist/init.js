export function init(template, ctx, target, options) {
    const clonedTemplate = template.localName === 'template' ? template.content.cloneNode(true) : template;
    ctx.template = clonedTemplate;
    if (ctx.Transform) {
        const firstChild = clonedTemplate.firstElementChild;
        if (firstChild !== null) {
            ctx.leaf = firstChild;
            process(ctx, 0, 0, options);
        }
    }
    const verb = options && options.prepend ? "prepend" : "appendChild";
    target[verb](ctx.template);
    return ctx;
}
function isTR(obj) {
    const firstCharOfFirstProp = Object.keys(obj)[0];
    return 'SNTM'.indexOf(firstCharOfFirstProp) === -1;
}
export function process(context, idx, level, options) {
    const target = context.leaf;
    if (target.matches === undefined)
        return;
    const transform = context.Transform;
    let nextTransform = {};
    let nextSelector = '';
    let firstSelector = true;
    let matchNextSib = true;
    let inherit = false;
    let nextMatch = [];
    for (const selector in transform) {
        if (target.matches(selector)) {
            const transformTemplateVal = transform[selector];
            switch (typeof transformTemplateVal) {
                case "object":
                    nextSelector = '*';
                    Object.assign(nextTransform, transformTemplateVal);
                    break;
                case "function":
                    const transformTemplate = transformTemplateVal;
                    const resp = transformTemplate({
                        target: target,
                        ctx: context,
                        idx: idx,
                        level: level
                    });
                    if (resp !== undefined) {
                        switch (typeof resp) {
                            case "string":
                                target.textContent = resp;
                                break;
                            case "object":
                                if (isTR(resp)) {
                                    const respAsTransformRules = resp;
                                    nextSelector = '*';
                                    Object.assign(nextTransform, respAsTransformRules);
                                }
                                else {
                                    const respAsNextStep = resp;
                                    inherit = inherit || !!resp.MergeTransforms;
                                    nextSelector = (firstSelector ? '' : ',') + respAsNextStep.Select;
                                    firstSelector = false;
                                    const newTransform = respAsNextStep.Transform;
                                    if (newTransform === undefined) {
                                        Object.assign(nextTransform, context.Transform);
                                    }
                                    else {
                                        Object.assign(nextTransform, newTransform);
                                    }
                                    if (respAsNextStep.SkipSibs)
                                        matchNextSib = false;
                                    if (!matchNextSib && resp.NextMatch) {
                                        nextMatch.push(resp.NextMatch);
                                    }
                                }
                                break;
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
    }
    else if (nextMatch.length > 0) {
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
