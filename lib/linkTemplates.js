export function linkTemplates(elementInHost, host, ids) {
    const rn = elementInHost.getRootNode();
    if (rn.nodeType === 9) {
        for (const id of ids) {
            host[id] = convertToTemplate(self[id]);
        }
    }
    else {
        for (const id of ids) {
            const el = rn.querySelector(`#${id}`);
            if (el !== null) {
                host[id] = convertToTemplate(el);
            }
            else {
                console.error(`Element with id ${id} not found in host`);
            }
        }
    }
}
function convertToTemplate(el) {
    if (el.localName === 'template')
        return el;
    const templ = document.createElement('template');
    templ.innerHTML = el.outerHTML;
    return templ;
}
