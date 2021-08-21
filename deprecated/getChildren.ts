export function getChildren(parent: HTMLElement){
    const returnObj: HTMLElement[] = [];
    if(parent.shadowRoot) {
        parent.shadowRoot.childNodes.forEach(node =>{
            returnObj.push(node as HTMLElement);
        });
    }
    parent.childNodes.forEach(node =>{
        returnObj.push(node as HTMLElement);
    })
    return returnObj;
           
}