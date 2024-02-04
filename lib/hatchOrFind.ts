export async function hatchOrFind(templ: HTMLTemplateElement){
    //TODO: add caching if it helps performance, starting with the split itemref attribute
    const itemref= templ.getAttribute('itemref');
    if(itemref === null){
        const keys : string[] = [];
        const clone = templ.content.cloneNode(true) as DocumentFragment;
        const elements = Array.from(clone.children);
        templ.after(clone);

        for(const child of elements){
            if(!child.id){
                child.id = 'a' + crypto.randomUUID();
            }
            keys.push(child.id);

        }
        templ.setAttribute('itemref', keys.join(' '));
        if(!templ.hasAttribute('itemscope')) templ.setAttribute('itemscope', '');
        return {
            elements,
            state: 'hatched'
        };
    }else{
        const rn = templ.getRootNode() as DocumentFragment;
        const keys = itemref.split(' ');
        const elements: Array<Element> = [];
        for(const key of keys){
            const child = rn.getElementById(key);
            if(child === null) continue;
            elements.push(child);
        }
        return {
            elements,
            state: 'found'
        }
    }
}

