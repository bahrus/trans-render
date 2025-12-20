//TODO support scoped registries
/**
 * 
 * @param tagName 
 * @param MyElementClass 
 * @param cssImporter 
 */
export async function def(tagName: string, MyElementClass: any, cssImporter?: () => Promise<string>){
    let n = 0;
    let name = tagName;
    while(true){
        if(n > 0) name = `${tagName}-${n}`;
        const test = customElements.get(name);
        if(test === undefined){
            customElements.define(name, MyElementClass);
            break;;
        }else{
            if(test === MyElementClass){
                break;
            }
        }
        n++;
    }
    if(cssImporter){
        const css = await cssImporter();
        const style = document.createElement('style');
        style.innerHTML = `${name} { ${css} }`;
        document.head.appendChild(style);
    }
    
}