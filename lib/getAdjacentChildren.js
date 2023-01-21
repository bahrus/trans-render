export function getAdjacentChildren(templ) {
    const children = [];
    const cnt = Number(templ.dataset.cnt);
    let idx = 1;
    let ns = templ;
    while (idx < cnt && ns !== null) {
        ns = ns.nextSibling;
        if (ns instanceof Element)
            children.push(ns);
        idx++;
    }
    return children;
}
