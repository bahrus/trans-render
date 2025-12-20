//TODO support scoped registries
/**
 * 
 * @param tagName 
 * @param MyElementClass 
 * @param cssImporter 
 */
export async function def(tagName: string, MyElementClass: any, cssImporter?: () => Promise<{ default: CSSStyleSheet }>) {
    let n = 0;
    let name = tagName;
    while (true) {
        if (n > 0) name = `${tagName}-${n}`;
        const test = customElements.get(name);
        if (test === undefined) {
            customElements.define(name, MyElementClass);
            break;;
        } else {
            if (test === MyElementClass) {
                break;
            }
        }
        n++;
    }
    if (cssImporter) {
        const styles = await cssImporter();
        document.adoptedStyleSheets = [nestStyleSheet(styles.default, name)];
    }

}

function nestStyleSheet(originalSheet: CSSStyleSheet, outerSelector: string): CSSStyleSheet {
    const newSheet = new CSSStyleSheet();

    // Build nested CSS text
    let nestedRules = [];

    for (const rule of originalSheet.cssRules) {
        nestedRules.push(rule.cssText);
    }

    // Wrap all rules in the outer selector using nested CSS syntax
    const nestedCSS = `${outerSelector} {
        ${nestedRules.join('\n  ')}
    }`;

    newSheet.replaceSync(nestedCSS);
    return newSheet;
}


