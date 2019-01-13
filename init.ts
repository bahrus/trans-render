
export type TransformRules = {[key: string] : (arg: TransformArg) => void };
export interface TransformArg {
    target: Element,
    ctx: InitContext,
    idx: number,
    level: number,
}
// export interface BaseContext {
//     //model: any,
//     leaf: Element,
// }
export interface InitContext{
    init?: (template: HTMLTemplateElement, ctx: InitContext, target: HTMLElement) => InitContext,
    leaf?: Element,
    transform? : TransformRules | undefined,
    matchFirstChild?: boolean | TransformRules | undefined,
    matchNextSib?: boolean | TransformRules | undefined,
    drillTo?: string | null | undefined,
    template?: DocumentFragment,
    update?: (ctx: InitContext, target: HTMLElement) => InitContext; 
}

export function init(template: HTMLTemplateElement, ctx: InitContext, target: Element) : InitContext{
    ctx.init = init;
    const clonedTemplate = template.content.cloneNode(true) as DocumentFragment;
    ctx.template = clonedTemplate;
    if(ctx.transform){
        const firstChild = clonedTemplate.firstElementChild;
        if(firstChild !== null){
            ctx.leaf = firstChild;
            process(ctx, 0, 0);
        }

    }

    target.appendChild(ctx.template);
    return ctx;
}

export function process(context: InitContext, idx: number, level: number){
    const target = context.leaf!;
    if(target.matches === undefined) return;
    const transform = context.transform;
    
    context.matchFirstChild = false;
    context.matchNextSib = false;
    context.drillTo = null;
    for(const selector in transform){
        if(target.matches(selector)){
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
    const drillTo = context.drillTo;
    if(matchNextSib){
        let transform = context.transform;
        if(typeof(matchNextSib) === 'object'){
            context.transform = matchNextSib;
        }
        const nextSib = target.nextElementSibling;
        if(nextSib !== null){
            context.leaf = nextSib;
            process(context, idx + 1, level);
        }
        context.transform = transform;
    }
    if(matchFirstChild || drillTo){
        let transform = context.transform;
        if(typeof(matchFirstChild) === 'object'){
            context.transform = matchFirstChild;
        }
        let nextChild : Element | null;
        if(context.drillTo !== null){
            nextChild = target.querySelector(context.drillTo);
        }else{
            nextChild = target.firstElementChild;
        }
        //const firstChild = target.firstElementChild;
        if(nextChild !== null){
            context.leaf = nextChild;
            process(context, 0, level + 1);
        }
        context.transform = transform;
    }
    context.matchFirstChild = matchFirstChild;
    context.matchNextSib = matchNextSib;
}