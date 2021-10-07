export function getHost(self:Element): HTMLElement{
    let host = (<any>self.getRootNode()).host;
    if(host === undefined){
        host = self.parentElement;
        while(host && !host.localName.includes('-')){
            host = host.parentElement;
        }
    }
    return host;
}