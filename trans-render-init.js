export function init(template, ctx, target) {
    const transformScriptSelector = 'script[transform]';
    const clonedTemplate = template.content.cloneNode(true);
    ctx.template = clonedTemplate;
    if (!ctx.transform) {
        const scriptTransform = clonedTemplate.querySelector(transformScriptSelector);
        if (scriptTransform === null)
            throw "Transform Required";
        ctx.transform = eval(scriptTransform.innerHTML);
        scriptTransform.remove();
    }
    const children = clonedTemplate.children;
    for (let i = 0, ii = children.length; i < ii; i++) {
        const child = children[i];
        const base = {
            model: ctx.model,
            leaf: child,
        };
        Object.assign(ctx, base);
        ctx.level = 0;
        ctx.stack = [base];
        process(ctx);
    }
    target.appendChild(ctx.template);
    return ctx;
}
function process(context) {
    const target = context.leaf;
    if (target.matches === undefined)
        return;
    const transform = context.transform;
    const children = target.children;
    const childCount = children.length;
    for (const selector in transform) {
        if (target.matches(selector)) {
            const transformTemplate = transform[selector];
            context.matchChildren = false;
            //context.template = target;
            transformTemplate({
                target: target,
                ctx: context
            });
            if (context.matchChildren && childCount > 0) {
                context.level++;
                //const s = context.stack;
                //s.push(target);
                //context.leaf = target;
                for (let i = 0; i < childCount; i++) {
                    const child = children[i];
                    //const s = context.stack;
                    //s.push(child);
                    //context.level++;
                    context.leaf = child;
                    process(context);
                    context.leaf = target;
                    //s.pop();
                    //context.level
                }
                //s.pop();               
                context.level--;
                //context.leaf = s.length > 0 ? s[s.length -1] : null;
            }
        }
    }
}
//# sourceMappingURL=trans-render-init.js.map