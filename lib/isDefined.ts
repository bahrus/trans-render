export async function isDefined(el: Element){
    if(!el.localName.includes('-')) return true;
    await customElements.whenDefined(el.localName);
    return true;
}

export async function isResolved(host: EventTarget): Promise<void>{
    return new Promise(resolved => {
        host.addEventListener('resolved', e => {
            resolved();
        }, {once: true});
    });
}