export async  function getHost(self:Element, tocoho?: boolean | string): Promise<Element | null>{
    let host: Element | null | undefined;
    if(tocoho){
        const closest = tocoho === true ? '[itemscope]' : tocoho;
        host = (self.parentElement || self).closest(closest);
        if(host) return host;
    }
    const {onConnected} = await import('./onConnected');
    await onConnected(self);
    host = (<any>self.getRootNode()).host;
    if(host === undefined){
        host = self.parentElement;
        while(host && !host.localName.includes('-')){
            host = host.parentElement;
        }
    }
    return host;
}