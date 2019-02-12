//https://stackoverflow.com/questions/15086677/replace-specific-tag-name-javascript
export function renameTag(src: HTMLElement, newTag: string) {
    const parentNode = src.parentNode;
    if(parentNode === null) return;
    const newEl = document.createElement(newTag);
    while (src.firstChild) {
        newEl.appendChild(src.firstChild); // *Moves* the child
    }
    src.style.display = 'none';
    src.insertAdjacentElement('afterend', newEl);
    return newEl;        
}



