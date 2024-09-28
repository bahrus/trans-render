export function stdProp(el: Element){
    if(el.hasAttribute('itemprop')){
        return el.getAttribute('itemprop')?.split(' ')[0];
    }
    return (el as any).name || el.id;
}