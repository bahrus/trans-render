export async function isDefined(el: Element){
    if(!el.localName.includes('-')) return true;
    await customElements.whenDefined(el.localName);
    return true;
}

