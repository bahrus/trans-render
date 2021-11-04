export function getHost(self:Element, tocoho?: boolean): Element | null{
    let host: Element | null | undefined;
    if(tocoho){
        host = (self.parentElement || self).closest('[data-is-hostish]');
        if(host) return host;
    }
    host = (<any>self.getRootNode()).host;
    if(host === undefined){
        host = self.parentElement;
        while(host && !host.localName.includes('-')){
            host = host.parentElement;
        }
    }
    return host;
}