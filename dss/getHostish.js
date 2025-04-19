export async function getHostish(el) {
    let { localName, ish } = el;
    if (localName.includes('-')) {
        await customElements.whenDefined(localName);
        return el;
    }
    if (ish instanceof HTMLElement)
        return ish;
    const itemScopeAttr = el.getAttribute('itemscope');
    if (itemScopeAttr) {
        const { waitForIsh } = await import('mount-observer/waitForIsh.js');
        return await waitForIsh(el);
    }
}
