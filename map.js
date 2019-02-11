//https://stackoverflow.com/questions/15086677/replace-specific-tag-name-javascript
function replaceTag(src, newTag) {
    const parentNode = src.parentNode;
    if (parentNode === null)
        return;
    const newEl = document.createElement(newTag);
    // Copy the children
    while (src.firstChild) {
        newEl.appendChild(src.firstChild); // *Moves* the child
    }
    // Copy the attributes
    for (let idx = src.attributes.length - 1; idx >= 0; --idx) {
        const attr = src.attributes[idx];
        newEl.setAttribute(attr.name, attr.value);
    }
    // Replace it
    parentNode.replaceChild(src, newEl);
}
export function map(src, transform) {
    for (const key in transform) {
        const newTagName = transform[key];
        Array.from(src.querySelectorAll(key)).forEach(el => {
            replaceTag(el, newTagName);
        });
    }
}
