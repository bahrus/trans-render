
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
    transform : {[key: string] : (arg: ITransformArg) => void },
    stack: any[],
    matchChildren: boolean,
    template: DocumentFragment,
    level: number,
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
        const children = clonedTemplate.children;
        for(let i = 0, ii = children.length; i < ii; i++){
            const child = children[i];
            const base = {
                model: ctx.model,
                leaf: child,
            } as IBaseContext;
            Object.assign(ctx, base);
            ctx.level = 0;
            ctx.stack = [base];
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

    const children = target.children;
    const childCount = children.length;
    for(const selector in transform){
        if(target.matches(selector)){
            const transformTemplate = transform[selector];
            context.matchChildren = false;
            //context.template = target;
            transformTemplate({
                target: target, 
                ctx: context
            });
            if(context.matchChildren && childCount > 0){
                context.level++;
                //const s = context.stack;

                //s.push(target);
                //context.leaf = target;
                for(let i = 0; i <childCount; i++){
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