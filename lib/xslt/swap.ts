const nogo =  ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'];

export function swap(target: Element, toIsh: boolean){
    const qry = toIsh ? nogo.join(',') : nogo.join('-ish,');
    const problemTags = target.querySelectorAll(qry);
    problemTags.forEach(tag => {
        const newTagName = toIsh ? tag.localName + '-ish' : tag.localName.substring(0, tag.localName.length - 4);
        const newTag = document.createElement(newTagName);
        for(let i = 0, ii = tag.attributes.length; i < ii; i++){
            newTag.setAttribute(tag.attributes[i].name, tag.attributes[i].value);
            
        }
        tag.insertAdjacentElement('afterend', newTag);
    });
    problemTags.forEach(tag => tag.remove());        
}