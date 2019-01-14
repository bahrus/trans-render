
export type TransformRules = { [key: string]: (arg: TransformArg) => NextSteps | string };
export interface TransformArg {
    target: Element,
    ctx: InitContext,
    idx: number,
    level: number,
}

export interface NextSteps {
    matchFirstChild?: boolean | TransformRules,
    matchNextSib?: boolean | TransformRules,
    drill?: TransformRules | null,
    inheritMatches?: boolean,
}

export interface InitContext {
    init?: (template: HTMLTemplateElement, ctx: InitContext, target: HTMLElement) => InitContext,
    leaf?: Element,
    transform?: TransformRules,
    inheritMatches?: boolean,
    template?: DocumentFragment,
    update?: (ctx: InitContext, target: HTMLElement) => InitContext;
}

export function init(template: HTMLTemplateElement, ctx: InitContext, target: Element): InitContext {
    ctx.init = init;
    const clonedTemplate = template.content.cloneNode(true) as DocumentFragment;
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
function inheritTemplate(context: InitContext, transform: TransformRules) {
    if (context.inheritMatches) {
        return Object.assign(Object.assign({}, context.transform), transform);
    }
    return transform;
}
export function process(context: InitContext, idx: number, level: number) {
    const target = context.leaf!;
    if (target.matches === undefined) return;
    const transform = context.transform;

    let drill: TransformRules | null = null;
    let matchFirstChild: TransformRules | boolean = false;
    let matchNextSib: TransformRules | boolean = false;
    context.inheritMatches = false;
    for (const selector in transform) {
        if (target.matches(selector)) {
            const transformTemplate = transform[selector];

            const resp = transformTemplate({
                target: target,
                ctx: context,
                idx: idx,
                level: level
            });
            if (resp !== undefined) {
                switch (typeof resp) {
                    case 'string':
                        target.textContent = resp;
                        break;
                    case 'object':
                        if (resp.drill !== undefined) {
                            drill = drill === null ? resp.drill : Object.assign(drill, resp.drill);
                        }
                        if (resp.matchFirstChild !== undefined) {
                            switch (typeof resp.matchFirstChild) {
                                case 'boolean':
                                    if (typeof matchFirstChild === 'boolean' && resp.matchFirstChild) {
                                        matchFirstChild = true;
                                    }
                                    break;
                                case 'object':
                                    if (typeof matchFirstChild === 'object') {
                                        Object.assign(matchFirstChild, resp.matchFirstChild);
                                    } else {
                                        matchFirstChild = resp.matchFirstChild;
                                    }
                                    break;

                            }
                        }
                        if (resp.matchNextSib !== undefined) {
                            switch (typeof resp.matchNextSib) {
                                case 'boolean':
                                    if (typeof matchNextSib === 'boolean' && resp.matchNextSib) {
                                        matchNextSib = true;
                                    }
                                    break;
                                case 'object':
                                    if (typeof matchNextSib === 'object') {
                                        Object.assign(matchNextSib, resp.matchNextSib);
                                    } else {
                                        matchNextSib = resp.matchNextSib;
                                    }
                                    break;
                            }
                        }
                        break;
                }

            }
        }
    }
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

        let nextChild: Element | null;
        if (drill !== null) {
            const keys = Object.keys(drill);
            nextChild = target.querySelector(keys[0]);
            context.transform = inheritTemplate(context, drill);
        } else {
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
    //context.matchFirstChild = matchFirstChild;
    //context.matchNextSib = matchNextSib;
}