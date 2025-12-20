export function nestStyleSheet(originalSheet: CSSStyleSheet, outerSelector: string): CSSStyleSheet {
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