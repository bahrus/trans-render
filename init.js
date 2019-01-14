export function init(template, ctx, target) {
    ctx.init = init;
    const clonedTemplate = template.content.cloneNode(true);
    ctx.template = clonedTemplate;
    if (ctx.transform) {
        const firstChild = clonedTemplate.firstElementChild;
        if (firstChild !== null) {
            ctx.leaf = firstChild;
            process(ctx, 0, 0);
        }
    }
    target.appendChild(ctx.template);
    return ctx;
}
function inheritTemplate(context, transform) {
    if (context.inheritMatches) {
        return Object.assign(Object.assign({}, context.transform), transform);
    }
    return transform;
}
export function process(context, idx, level) {
    const target = context.leaf;
    if (target.matches === undefined)
        return;
    const transform = context.transform;
    context.matchFirstChild = false;
    context.matchNextSib = false;
    context.drill = null;
    context.inheritMatches = false;
    for (const selector in transform) {
        if (target.matches(selector)) {
            const transformTemplate = transform[selector];
            transformTemplate({
                target: target,
                ctx: context,
                idx: idx,
                level: level
            });
        }
    }
    const matchNextSib = context.matchNextSib;
    const matchFirstChild = context.matchFirstChild;
    const drill = context.drill;
    if (matchNextSib) {
        let transform = context.transform;
        if (typeof (matchNextSib) === 'object') {
            context.transform = inheritTemplate(context, matchNextSib);
        }
        const nextSib = target.nextElementSibling;
        if (nextSib !== null) {
            context.leaf = nextSib;
            process(context, idx + 1, level);
        }
        context.transform = transform;
    }
    if (matchFirstChild || drill !== null) {
        let transform = context.transform;
        let nextChild;
        if (drill !== null) {
            const keys = Object.keys(drill);
            nextChild = target.querySelector(keys[0]);
            context.transform = inheritTemplate(context, drill);
        }
        else {
            nextChild = target.firstElementChild;
            if (typeof (matchFirstChild) === 'object') {
                context.transform = inheritTemplate(context, matchFirstChild);
            }
        }
        //const firstChild = target.firstElementChild;
        if (nextChild !== null) {
            context.leaf = nextChild;
            process(context, 0, level + 1);
        }
        context.transform = transform;
    }
    context.matchFirstChild = matchFirstChild;
    context.matchNextSib = matchNextSib;
}
//# sourceMappingURL=init.js.map