export async function getHostish(el: Element){
    let {localName, ish} = el as any;
    if(localName.includes('-')){
        await customElements.whenDefined(localName);
        return el;
    }
    if(ish instanceof HTMLElement) return ish;
    const itemScopeAttr = el.getAttribute('itemscope');
    if(itemScopeAttr){
        //let ish = (<any>el).ish as HTMLElement | undefined;
        //if(host) return getHostish(host, prop);
        const {Newish, waitForEvent} = await import('./Newish.js');
        const ah = new Newish(el, itemScopeAttr);
        if(!ah.isResolved){
            await waitForEvent(ah, 'resolved');
        }
        ish = (<any>el).ish as HTMLElement | undefined;
        return ish;
        
    }
}