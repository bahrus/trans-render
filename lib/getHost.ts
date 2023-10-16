export function getHost(self:Element, tocoho: boolean | string = false, ish: boolean = false): EventTarget | null{
    let host: Element | null | undefined;
    if(tocoho){
        const closest = tocoho === true ? '[itemscope]' : tocoho;
        host = (self.parentElement || self).closest(closest);
        if(host) {
            const scope = (<any>host)?.beDecorated?.scoped?.scope as EventTarget;
            if(scope != undefined) return scope;
            if(host.localName.includes('-')) return host;
            return host;
        }
    }
    if(ish){
        host = self.parentElement;
        if(host !== null && host.localName.includes('-')) return host;
        while(host && !host.localName.includes('-')){
            host = host.parentElement;
            if(host !== null && host.localName.includes('-') && !host.shadowRoot === null) return host;
        }
        

    }
    host = (<any>self.getRootNode()).host;
    if(host === undefined){
        return null;
    }
    return host;
}
