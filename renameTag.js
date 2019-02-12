//https://stackoverflow.com/questions/15086677/replace-specific-tag-name-javascript
export function renameTag(src, newTag) {
    const parentNode = src.parentNode;
    if (parentNode === null)
        return;
    const newEl = document.createElement(newTag);
    parentNode.replaceChild(src, newEl);
    return src;
}
