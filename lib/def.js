//TODO support scoped registries
/**
 *
 * @param tagName
 * @param MyElementClass
 * @param cssImporter
 */
export async function def(tagName, MyElementClass, cssImporter) {
    let n = 0;
    let name = tagName;
    while (true) {
        if (n > 0)
            name = `${tagName}-${n}`;
        const test = customElements.get(name);
        if (test === undefined) {
            customElements.define(name, MyElementClass);
            break;
            ;
        }
        else {
            if (test === MyElementClass) {
                return;
            }
        }
        n++;
    }
    if (cssImporter) {
        const styles = await cssImporter();
        const { nestStyleSheet } = await import('./nestStyleSheet.js');
        document.adoptedStyleSheets = [nestStyleSheet(styles.default, name)];
    }
}
