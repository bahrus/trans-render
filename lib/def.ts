export function def(tagName: string, MyElementClass: any, ){
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
}