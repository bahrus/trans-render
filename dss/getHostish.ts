export async function getHostish(el: Element){
    let {localName, ish} = el as any;
    if(localName.includes('-')){
        await customElements.whenDefined(localName);
        return el;
    }
    if(ish instanceof HTMLElement) return ish;
    const itemScopeAttr = el.getAttribute('itemscope');
    if(itemScopeAttr){
        const {waitForEvent} = await import('mount-observer/waitForEvent.js');
        let ish = (<any>el).ish as HTMLElement | undefined;
        if(ish) return ish;
        await waitForEvent(el, 'ish-resolved');
        return (<any>el).ish as HTMLElement;
    }
}