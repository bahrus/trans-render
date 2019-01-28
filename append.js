export function append(target, template) {
    target.appendChild(template.content.cloneNode(true));
}
