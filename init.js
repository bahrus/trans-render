export const _rules = "_rules";
export function init(template, ctx, target, options) {
    //ctx.init = init;
    const clonedTemplate = template.content.cloneNode(true);
    ctx.template = clonedTemplate;
    if (ctx.transform) {
        const firstChild = clonedTemplate.firstElementChild;
        if (firstChild !== null) {
            ctx.leaf = firstChild;
            process(ctx, 0, 0);
        }
    }
    const verb = options && options.prepend ? "prepend" : "appendChild";
    target[verb](ctx.template);
    return ctx;
}
function inheritTemplate(context, transform, inherit) {
    if (inherit) {
        return Object.assign(Object.assign({}, context.transform), transform);
    }
    return transform;
}
export function process(context, idx, level) {
    const target = context.leaf;
    if (target.matches === undefined)
        return;
    const transform = context.transform;
    let drill = null;
    let matchFirstChild = false;
    let matchNextSib = false;
    let inherit = false;
    let nextMatch = [];
    //context.inheritMatches = false;
    for (const selector in transform) {
        if (selector === _rules)
            continue;
        if (target.matches(selector)) {
            const transformTemplateVal = transform[selector];
            switch (typeof transformTemplateVal) {
                case "object":
                    if (typeof matchFirstChild === "object") {
                        Object.assign(matchFirstChild, transformTemplateVal);
                    }
                    else {
                        matchFirstChild = transformTemplateVal;
                    }
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
                                if (resp[_rules]) {
                                    const respAsTransformRules = resp;
                                    if (typeof matchFirstChild === "object") {
                                        Object.assign(matchFirstChild, respAsTransformRules);
                                    }
                                    else {
                                        matchFirstChild = respAsTransformRules;
                                    }
                                }
                                else {
                                    const respAsNextSteps = resp;
                                    inherit = inherit || !!resp.inheritMatches;
                                    if (respAsNextSteps.select !== undefined) {
                                        drill =
                                            drill === null
                                                ? respAsNextSteps.select
                                                : Object.assign(drill, resp.select);
                                    }
                                    if (resp.matchFirstChild !== undefined) {
                                        switch (typeof resp.matchFirstChild) {
                                            case "boolean":
                                                if (typeof matchFirstChild === "boolean" &&
                                                    resp.matchFirstChild) {
                                                    matchFirstChild = true;
                                                }
                                                break;
                                            case "object":
                                                if (typeof matchFirstChild === "object") {
                                                    Object.assign(matchFirstChild, resp.matchFirstChild);
                                                }
                                                else {
                                                    matchFirstChild = resp.matchFirstChild;
                                                }
                                                break;
                                        }
                                    }
                                    if (resp.matchNextSib)
                                        matchNextSib = true;
                                    if (!matchNextSib && resp.nextMatch) {
                                        nextMatch.push(resp.nextMatch);
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
        let transform = context.transform;
        if (typeof matchNextSib === "object") {
            context.transform = inheritTemplate(context, matchNextSib, inherit);
        }
        const nextSib = target.nextElementSibling;
        if (nextSib !== null) {
            context.leaf = nextSib;
            process(context, idx + 1, level);
        }
        context.transform = transform;
    }
    else if (nextMatch.length > 0) {
        const match = nextMatch.join(",");
        let nextSib = target.nextElementSibling;
        while (nextSib !== null) {
            if (nextSib.matches(match)) {
                context.leaf = nextSib;
                process(context, idx + 1, level);
                break;
            }
            nextSib = nextSib.nextElementSibling;
        }
    }
    if (matchFirstChild || drill !== null) {
        let transform = context.transform;
        let nextChild;
        if (drill !== null) {
            const keys = Object.keys(drill);
            nextChild = target.querySelector(keys[0]);
            context.transform = inheritTemplate(context, drill, inherit);
        }
        else {
            nextChild = target.firstElementChild;
            if (typeof matchFirstChild === "object") {
                context.transform = inheritTemplate(context, matchFirstChild, inherit);
            }
        }
        if (nextChild !== null) {
            context.leaf = nextChild;
            process(context, 0, level + 1);
        }
        context.transform = transform;
    }
}
//# sourceMappingURL=init.js.map