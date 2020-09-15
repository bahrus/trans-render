export function insertAdjacentTemplate(template, target, position, callback) {
    const clone = document.importNode(template.content, true);
    if (callback !== undefined)
        callback(clone);
    let appendTarget = target;
    let isFirst = true;
    const appendedChildren = [];
    Array.from(clone.children).forEach(child => {
        const modifiedPosition = isFirst ? position : 'afterend';
        isFirst = false;
        appendTarget = appendTarget.insertAdjacentElement(modifiedPosition, child);
        appendedChildren.push(appendTarget);
    });
    return appendedChildren;
}
