export function insertAdjacentClone(clone, target, position) {
    let appendTarget = target;
    let lastTextNode;
    let prevAppendTarget = appendTarget;
    let isFirst = true;
    const childNodes = Array.from(clone.childNodes);
    for (const child of childNodes) {
        const modifiedPosition = isFirst ? position : 'afterend';
        isFirst = false;
        //assume for now alternates between element nodes and non element nodes
        //surely there's a better way?
        if (child.nodeType === 1) {
            appendTarget = appendTarget.insertAdjacentElement(modifiedPosition, child);
            if (lastTextNode !== undefined) {
                prevAppendTarget.insertAdjacentText('afterend', lastTextNode.textContent);
                prevAppendTarget = appendTarget;
                lastTextNode = undefined;
            }
        }
        else {
            lastTextNode = child;
        }
    }
}
