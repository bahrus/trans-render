type Constructor<T = {}> = new (...args: any[]) => T;
export function define<TBase extends Constructor<HTMLElement>>(superClass: TBase, tagName?: string) {
    tagName = tagName || (<any>superClass).is as string;
    if(customElements.get(tagName)){
        console.warn('Already registered ' + tagName);
        return;
    }
    customElements.define(tagName, superClass);
}
