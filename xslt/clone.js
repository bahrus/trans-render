export function clone(target) {
    const clone = target.cloneNode(true);
    const templates = Array.from(clone.querySelectorAll('template'));
    for (const template of templates) {
        template.after(template.cloneNode(true));
        template.remove();
    }
    return clone;
}
