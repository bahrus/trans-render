export function insertAdjacentTemplate(template, target, position) {
    const clone = document.importNode(template.content, true);
    let appendTarget = target;
    Array.from(clone.children).forEach(child => {
        appendTarget = appendTarget.insertAdjacentElement(position, child);
    });
}
