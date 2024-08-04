let cnt = 0;
export function insertTempl(templ, baseID) {
    const keys = [];
    let templToClone = templ;
    const externalRefId = templToClone.dataset.blowDryRef;
    if (externalRefId)
        templToClone = window[externalRefId];
    const clone = templToClone.content.cloneNode(true);
    for (const child of clone.children) {
        if (!child.id) {
            child.id = `${baseID}_${cnt}`;
            cnt++;
        }
        keys.push(child.id);
    }
    templ.setAttribute('itemref', keys.join(' '));
    if (!templ.hasAttribute('itemscope'))
        templ.setAttribute('itemscope', '');
    templ.after(clone);
}
export function getDep(templ, refs) {
    const rn = templ.getRootNode();
    const keys = refs
        .split(' ')
        .map(s => s.trim())
        .filter(s => !!s)
        .map(key => rn.getElementById(key))
        .filter(x => x !== null);
}
