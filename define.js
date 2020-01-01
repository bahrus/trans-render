export function define(superClass) {
    const tagName = superClass.is;
    if (customElements.get(tagName)) {
        console.warn('Already registered ' + tagName);
        return;
    }
    customElements.define(tagName, superClass);
}
