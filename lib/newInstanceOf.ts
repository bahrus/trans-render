export function newInstanceOf(ctr: {new(): HTMLElement}, initProps?: any){
    const localName = (<any>customElements).getName(ctr);
    const instance = document.createElement(localName);
    if(initProps !== undefined){
        Object.assign(instance, initProps);
    }
    return instance;
}