export const countKey = '__transRenderCount';
export const initKey = '__trInit';
export function repeatInit(count: number, template: HTMLTemplateElement, target: HTMLElement){
    (<any>target)[countKey] = count;
    for(let i =0; i < count; i++){
        const clonedTemplate = template.content.cloneNode(true) as DocumentFragment;
        Array.from(clonedTemplate.children).forEach(c =>{
            c.setAttribute(initKey, '');
        })
        //TODO:  assign index to children
        target.appendChild(clonedTemplate);
        
    }
}