export class DoStyles {
    constructor(self, { styles }, root, compiledStyleMap, modernBrowser) {
        let styleSheets;
        if (typeof styles === 'string') {
            const isReally = self.constructor.isReally;
            if (!compiledStyleMap.has(isReally)) {
                const strippedStyle = styles.replace('<style>', '').replace('</style>', '');
                if (modernBrowser) {
                    const sheet = new CSSStyleSheet();
                    sheet.replaceSync(strippedStyle);
                    compiledStyleMap.set(isReally, [sheet]);
                }
                else {
                    const tm = document.createElement('template');
                    const st = document.createElement('style');
                    st.innerHTML = strippedStyle;
                    tm.content.appendChild(st);
                    compiledStyleMap.set(isReally, tm);
                }
            }
            styleSheets = compiledStyleMap.get(isReally);
        }
        else {
            styleSheets = styles;
        }
        if (styleSheets instanceof HTMLTemplateElement) {
            root.appendChild(styleSheets.content.cloneNode(true));
        }
        else if (Array.isArray(styleSheets)) {
            root.adoptedStyleSheets = [...root.adoptedStyleSheets, ...styleSheets];
        }
    }
}
