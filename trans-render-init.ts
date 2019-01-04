
type TransformRules = {[key: string] : (arg: ITransformArg) => void };
export interface ITransformArg {
    target: Element,
    ctx: IContext,
}
export interface IBaseContext {
    model: any,
    leaf: Element,
}
export interface IContext extends IBaseContext{
    init: (template: HTMLTemplateElement, ctx: IContext, target: HTMLElement) => void,
    transform : TransformRules,
    //stack: any[],
    matchFirstChild: boolean | TransformRules,
    matchNextSib: boolean | TransformRules,
    template: DocumentFragment,
    //level: number,
}

export function init(template: HTMLTemplateElement, ctx: IContext, target: HTMLElement){
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
            const base = {
                leaf: firstChild
            } as IBaseContext;
            Object.assign(ctx, base);
            //ctx.level = 0;
            //ctx.stack = [base];
            process(ctx);
        }

    }

    target.appendChild(ctx.template);

    return ctx;
}

function process(context: IContext){
    const target = context.leaf;
    if(target.matches === undefined) return;
    const transform = context.transform;
    //const children = target.children;
    //const childCount = children.length;
    context.matchFirstChild = false;
    context.matchNextSib = false;
    
    for(const selector in transform){
        if(target.matches(selector)){
            const transformTemplate = transform[selector];

            //context.template = target;
            transformTemplate({
                target: target, 
                ctx: context
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
            process(context);
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
            process(context);
        }
        context.transform = transform;
    }
    context.matchFirstChild = matchFirstChild;
    context.matchNextSib = matchNextSib;
}