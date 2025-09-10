import 'mount-observer/refid/hostish.js';
function getByIdInclusive(fragment, id) {
    if (fragment instanceof Element && fragment.id === id)
        return fragment;
}
export async function find(el, specifier) {
    const { id, host } = specifier;
    if (id !== undefined)
        return getByIdInclusive(el.getRootNode(), id);
    if (host === true)
        return el.getRootNode().host;
    return (await el.hostish());
}
