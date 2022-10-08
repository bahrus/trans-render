export function insertAdjacentClone(clone, target, position) {
    let appendTarget = target;
    let isFirst = true;
    Array.from(clone.children).forEach(child => {
        const modifiedPosition = isFirst ? position : 'afterend';
        isFirst = false;
        appendTarget = appendTarget.insertAdjacentElement(modifiedPosition, child);
    });
}
