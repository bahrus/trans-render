export function newInstanceOf(ctr, initProps) {
    const localName = customElements.getName(ctr);
    const instance = document.createElement(localName);
    if (initProps !== undefined) {
        Object.assign(instance, initProps);
    }
    return instance;
}
