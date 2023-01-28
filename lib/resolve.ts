let imports: any;
//const lowerCaseRe = /^[a-zA-Z]/;

export function resolve(href: string){
    let finalURL = href!;
    const linkTest = (<any>globalThis)[finalURL];
    if(linkTest instanceof HTMLLinkElement && (linkTest.hasAttribute('be-written') || linkTest.hasAttribute('data-be-written')) ){
        return linkTest.href;
        return finalURL;
    }
    const importMap = document.querySelector('script[type="importmap"]');
    if(importMap !== null){
        try{
            if(imports === undefined){
                imports = JSON.parse(importMap.innerHTML).imports;
            }
            for(const key in imports){
                if(finalURL.startsWith(key)){
                   return finalURL.replace(key, imports[key]);
                }
            }
        }catch(e){}
    }
   throw href + ' not resolved by import maps or link tag.'   
}
