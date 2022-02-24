export const scopedVersions = new WeakMap();
export function version(classes, versionFn, root) {
    if (!scopedVersions.has(root)) {
        scopedVersions.set(root, {});
    }
    const shadowDOMVersionLookup = scopedVersions.get(root);
    for (const cls of classes) {
        const [version, selector] = versionFn(cls);
        shadowDOMVersionLookup[selector] = version;
    }
}
