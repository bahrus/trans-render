export function stdVal(el: Element){
    const {localName} = el;
    switch(localName){
        case 'form':
            throw 'NI';
        case 'input':
            throw 'NI';
        case 'a':
            return (el as HTMLAnchorElement).href;
        case 'data':
            return JSON.parse((el as HTMLDataElement).value);
        default:
            return el.textContent;
    }
}