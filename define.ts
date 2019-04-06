export function define(custEl: any){
    let tagName = custEl.is;
    if(customElements.get(tagName)){
        console.warn('Already registered ' + tagName);
        return;
    }
    customElements.define(tagName, custEl);
}