export function clone(target: Element){
    const clone = target.cloneNode(true) as Element;
    const templates = Array.from(clone.querySelectorAll('template'));
    for(const template of templates){
        template.after(template.cloneNode(true));
        template.remove();
    }
    return clone;
}