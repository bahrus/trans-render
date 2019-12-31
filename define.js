export function define(superClass, tagName) {
    tagName = tagName || superClass.is;
    if (customElements.get(tagName)) {
        console.warn('Already registered ' + tagName);
        return;
    }
    customElements.define(tagName, superClass);
}
