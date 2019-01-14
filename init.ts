
export type TransformRules = {[key: string] : (arg: TransformArg) => void };
export interface TransformArg {
    target: Element,
    ctx: InitContext,
    idx: number,
    level: number,
}

export interface InitContext{
    init?: (template: HTMLTemplateElement, ctx: InitContext, target: HTMLElement) => InitContext,
    leaf?: Element,
    transform? : TransformRules,
    matchFirstChild?: boolean | TransformRules,
    matchNextSib?: boolean | TransformRules,
    inheritMatches?: boolean,
    drill?: TransformRules | null,
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
function inheritTemplate(context: InitContext, transform: TransformRules){
    if(context.inheritMatches){
        return Object.assign( Object.assign({}, context.transform), transform);
    }
    return transform;
}
export function process(context: InitContext, idx: number, level: number){
    const target = context.leaf!;
    if(target.matches === undefined) return;
    const transform = context.transform;
    
    context.matchFirstChild = false;
    context.matchNextSib = false;
    context.drill = null;
    context.inheritMatches = false;
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
    const drill = (<any>context.drill) as TransformRules | null;
    if(matchNextSib){
        let transform = context.transform;
        if(typeof(matchNextSib) === 'object'){
            context.transform = inheritTemplate(context, matchNextSib);
        }
        const nextSib = target.nextElementSibling;
        if(nextSib !== null){
            context.leaf = nextSib;
            process(context, idx + 1, level);
        }
        context.transform = transform;
    }
    
    if(matchFirstChild || drill !== null){
        let transform = context.transform;

        let nextChild : Element | null;
        if(drill !== null){
            const keys = Object.keys(drill);
            nextChild = target.querySelector(keys[0]);
            context.transform = inheritTemplate(context, drill);
        }else{
            nextChild = target.firstElementChild;
            if(typeof(matchFirstChild) === 'object'){
                context.transform = inheritTemplate(context, matchFirstChild);
            }
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