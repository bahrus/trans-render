import {TemplMgmtBase} from './types';
export class DoStyles{
    constructor(self: any, {styles}: TemplMgmtBase, root: ShadowRoot, compiledStyleMap: Map<string, CSSStyleSheet[] | HTMLTemplateElement>, modernBrowser: boolean){
        let styleSheets: CSSStyleSheet[] | HTMLTemplateElement | undefined;
        if(typeof styles === 'string'){
            const isReally = (<any>self.constructor).isReally as string;
            if(!compiledStyleMap.has(isReally)){
                const strippedStyle = styles.replace('<style>', '').replace('</style>', '');
                if(modernBrowser){
                    const sheet = new CSSStyleSheet();
                    (<any>sheet).replaceSync(strippedStyle);
                    compiledStyleMap.set(isReally, [sheet]);
                }else{
                    const tm = document.createElement('template');
                    const st = document.createElement('style');
                    st.innerHTML = strippedStyle;
                    tm.content.appendChild(st);
                    compiledStyleMap.set(isReally, tm);
                }
            }
            styleSheets = compiledStyleMap.get(isReally);
        }else{
            styleSheets = styles;
        }
        if(styleSheets instanceof HTMLTemplateElement){
            root.appendChild(styleSheets.content.cloneNode(true));
        }else if(Array.isArray(styleSheets)){
            (<any>root).adoptedStyleSheets = [...(<any>root).adoptedStyleSheets, ...styleSheets];
        }
    }
}