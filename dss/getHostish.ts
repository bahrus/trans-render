export async function getHostish(el: Element){
    let {localName, ish} = el as any;
    if(localName.includes('-')){
        await customElements.whenDefined(localName);
        return el;
    }
    if(ish instanceof HTMLElement) return ish;
    const itemScopeAttr = el.getAttribute('itemscope');
    if(itemScopeAttr){
        const {waitForIsh} = await import('mount-observer/waitForIsh.js');
        return await waitForIsh(el);
    }
}