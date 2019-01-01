
export interface IContext{
    transform : {[key: string] : (context: IContext) => void },
    input: any,
    stack: any[],
    matchChildren: boolean,
    leaf: Element | null,
    template: DocumentFragment,
    level: number,
}
export function render(template: HTMLTemplateElement, ctx: IContext){
    const clonedTemplate = template.content.cloneNode(true) as DocumentFragment;
    ctx.template = clonedTemplate
    if(!ctx.transform){
        const scriptTransform = clonedTemplate.querySelector('script[transform]');
        if(scriptTransform === null) throw "Transform Required";
        ctx.transform = eval(scriptTransform.innerHTML);
    }
    const children = clonedTemplate.children;
    for(let i = 0, ii = children.length; i < ii; i++){
        const child = children[i];
        ctx.level = 0;
        ctx.stack = [];
        ctx.leaf = child;
        process(ctx.leaf, ctx);
    }
    clonedTemplate.childNodes.forEach(node =>{
        
        process(ctx.leaf!, ctx);
    })

    return ctx;
}

function process(target: Element, context: IContext){
    if(target.matches === undefined) return;
    const transform = context.transform;
    const children = target.children;
    const childCount = children.length;
    for(const selector in transform){
        if(target.matches(selector)){
            const transformTemplate = transform[selector];
            context.matchChildren = false;
            //context.template = target;
            transformTemplate(context);
            if(context.matchChildren && childCount > 0){
                context.level++;
                const s = context.stack;
                s.push(target);
                context.leaf = target;
                for(let i = 0; i <childCount; i++){
                    const child = children[i];
                    //const s = context.stack;
                    //s.push(child);
                    //context.level++;
                    //context.leaf = child;
                    process(child, context);
                    s.pop();
                    context.level
                } 
                s.pop();               
                context.level--;
                context.leaf = s.length > 0 ? s[s.length -1] : null;
            }
        }
    }
}