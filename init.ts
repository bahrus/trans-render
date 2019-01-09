
type TransformRules = {[key: string] : (arg: TransformArg) => void };
export interface TransformArg {
    target: Element,
    ctx: InitContext,
    idx: number,
    level: number,
}
export interface BaseContext {
    model: any,
    leaf: Element,
}
export interface InitContext extends BaseContext{
    init: (template: HTMLTemplateElement, ctx: InitContext, target: HTMLElement) => void,
    transform : TransformRules,
    matchFirstChild: boolean | TransformRules,
    matchNextSib: boolean | TransformRules,
    template: DocumentFragment,
}

export function init(template: HTMLTemplateElement, ctx: InitContext, target: HTMLElement){
    ctx.init = init;
    const transformScriptSelector = 'script[transform]';
    const clonedTemplate = template.content.cloneNode(true) as DocumentFragment;
    ctx.template = clonedTemplate;
    if(!ctx.transform){
        const scriptTransform = clonedTemplate.querySelector(transformScriptSelector);
        if(scriptTransform !== null){
            ctx.transform = eval(scriptTransform.innerHTML);
            scriptTransform.remove();
        }

    }
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
    const target = context.leaf;
    if(target.matches === undefined) return;
    const transform = context.transform;
    
    context.matchFirstChild = false;
    context.matchNextSib = false;
    
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
    if(matchFirstChild ){
        let transform = context.transform;
        if(typeof(matchFirstChild) === 'object'){
            context.transform = matchFirstChild;
        }
        const firstChild = target.firstElementChild;
        if(firstChild !== null){
            context.leaf = firstChild;
            process(context, 0, level + 1);
        }
        context.transform = transform;
    }
    context.matchFirstChild = matchFirstChild;
    context.matchNextSib = matchNextSib;
}