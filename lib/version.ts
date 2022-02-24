export const scopedVersions = new WeakMap<ShadowRoot | Document, {[key: string] : string}>();
export function version(classes: {new():  HTMLElement}[], versionFn: (cls: {new(): HTMLElement}) => [string, string], root: ShadowRoot | Document){
    if(!scopedVersions.has(root)){
        scopedVersions.set(root, {});
    }
    const shadowDOMVersionLookup = scopedVersions.get(root)!;
    for(const cls of classes){
        const [version, selector] = versionFn(cls);
        shadowDOMVersionLookup[selector] = version;
    }
}