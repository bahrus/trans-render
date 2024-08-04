const guid = '0j9qIjjR+UWYLrZ3FskVig'
function getCount(baseID){
    const key = Symbol.for(guid + baseID);
    let returnCnt = window[key] || 0;
    const nextCnt = returnCnt + 1;
    window[key] = nextCnt;
    return returnCnt;
}
export function insertTempl(templ: HTMLTemplateElement, baseID: string){
    const keys : string[] = [];
    let templToClone = templ;
    const externalRefId = templToClone.dataset.blowDryRef;
    if(externalRefId) templToClone = (<any>window)[externalRefId];
    const clone = templToClone.content.cloneNode(true) as DocumentFragment;
    for(const child of clone.children){
        if(!child.id){
            const cnt = getCount(baseID);
            child.id = `${baseID}_${cnt}`;
        }
        keys.push(child.id);
    }
    templ.setAttribute('itemref', keys.join(' '));
    if(!templ.hasAttribute('itemscope')) templ.setAttribute('itemscope', '');
    templ.after(clone);
}
