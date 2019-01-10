export function init(template, ctx, target) {
    ctx.init = init;
    const transformScriptSelector = 'script[transform]';
    const clonedTemplate = template.content.cloneNode(true);
    ctx.template = clonedTemplate;
    if (!ctx.transform) {
        const scriptTransform = clonedTemplate.querySelector(transformScriptSelector);
        if (scriptTransform !== null) {
            ctx.transform = eval(scriptTransform.innerHTML);
            scriptTransform.remove();
        }
    }
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
export function process(context, idx, level) {
    const target = context.leaf;
    if (target.matches === undefined)
        return;
    const transform = context.transform;
    context.matchFirstChild = false;
    context.matchNextSib = false;
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
    if (matchNextSib) {
        let transform = context.transform;
        if (typeof (matchNextSib) === 'object') {
            context.transform = matchNextSib;
        }
        const nextSib = target.nextElementSibling;
        if (nextSib !== null) {
            context.leaf = nextSib;
            process(context, idx + 1, level);
        }
        context.transform = transform;
    }
    if (matchFirstChild) {
        let transform = context.transform;
        if (typeof (matchFirstChild) === 'object') {
            context.transform = matchFirstChild;
        }
        const firstChild = target.firstElementChild;
        if (firstChild !== null) {
            context.leaf = firstChild;
            process(context, 0, level + 1);
        }
        context.transform = transform;
    }
    context.matchFirstChild = matchFirstChild;
    context.matchNextSib = matchNextSib;
}