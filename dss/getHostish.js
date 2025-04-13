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
        const { waitForEvent } = await import('mount-observer/waitForEvent.js');
        let ish = el.ish;
        if (ish instanceof HTMLElement)
            return ish;
        await waitForEvent(el, 'ish-resolved');
        return el.ish;
    }
}
