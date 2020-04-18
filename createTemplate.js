function doeth(html) {
    const template = document.createElement("template");
    template.innerHTML = html;
    return template;
}
export function createTemplate(html, options) {
    let template;
    if (options !== undefined) {
        const ctx = options.ctx;
        const as = options.as;
        if (ctx !== undefined && as !== undefined) {
            if (ctx.templates === undefined)
                ctx.templates = {};
            if (ctx.templates[as] === undefined) {
                ctx.templates[as] = doeth(html);
            }
            template = ctx.templates[as];
        }
        else {
            template = doeth(html);
        }
        if (options.shadow) {
            template['_attachShadowOptions'] = options.shadow;
        }
        return template;
    }
    return doeth(html);
}
