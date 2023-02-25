export async function isDefined(el: Element){
    if(!el.localName.includes('-')) return true;
    await customElements.whenDefined(el.localName);
    if(!el.isConnected){
        await (async () => {
            return true;
        })();
    }
    return true;

    
}

