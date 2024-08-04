let cnt = 0;
export function insertTempl(templ: HTMLTemplateElement, baseID: string){
    const keys : string[] = [];
    let templToClone = templ;
    const externalRefId = templToClone.dataset.blowDryRef;
    if(externalRefId) templToClone = (<any>window)[externalRefId];
    const clone = templToClone.content.cloneNode(true) as DocumentFragment;
    for(const child of clone.children){
        if(!child.id){
            child.id = `${baseID}_${cnt}`;
            cnt++;
        }
        keys.push(child.id);
    }
    templ.setAttribute('itemref', keys.join(' '));
    if(!templ.hasAttribute('itemscope')) templ.setAttribute('itemscope', '');
    templ.after(clone);
}