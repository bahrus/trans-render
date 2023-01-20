export function getAdjacentChildren(templ: HTMLTemplateElement){
    const children: Element[] = [];
    const cnt = Number(templ.dataset.cnt);
    let idx = 1;
    let ns: Node | null = templ;
    while(idx < cnt && ns !== null){
        ns = ns.nextSibling;
        if(ns instanceof Element) children.push(ns);
        idx++;
    }
    return children;
}