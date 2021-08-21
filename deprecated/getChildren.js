export function getChildren(parent) {
    const returnObj = [];
    if (parent.shadowRoot) {
        parent.shadowRoot.childNodes.forEach(node => {
            returnObj.push(node);
        });
    }
    parent.childNodes.forEach(node => {
        returnObj.push(node);
    });
    return returnObj;
}
