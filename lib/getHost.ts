export function getHost(self:Element, tocoho?: boolean | string): EventTarget | null{
    let host: Element | null | undefined;
    if(tocoho){
        const closest = tocoho === true ? '[itemscope]' : tocoho;
        host = (self.parentElement || self).closest(closest);
        if(host) {
            const scope = (<any>host)?.beDecorated?.scoped?.scope as EventTarget;
            if(scope != undefined) return scope;
            return host;
        }
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