export function insertAdjacentTemplate(src, template) {
    const clonedTemplate = template.content.cloneNode(true);
    Array.from(clonedTemplate.children).forEach(child => {
        src.insertAdjacentElement('afterend', child);
    });
}
