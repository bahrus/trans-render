export function deleteEl(el: Element){
    const children = (<any>el).via.itemref.children as Array<Element>;
    for(const child of children){
        deleteEl(child);
    }
    el.remove();
}