import 'mount-observer/refid/hostish.js';
export async function find(el, specifier) {
    const { id, host } = specifier;
    if (id !== undefined)
        return el.getRootNode().getElementById(id);
    if (host === true)
        return el.getRootNode().host;
    return (await el.hostish());
}
