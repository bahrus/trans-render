export function getHost(self, tocoho = false, ish = false) {
    let host;
    if (tocoho) {
        const closest = tocoho === true ? '[itemscope]' : tocoho;
        host = (self.parentElement || self).closest(closest);
        if (host) {
            const scope = host?.beDecorated?.scoped?.scope;
            if (scope != undefined)
                return scope;
            if (host.localName.includes('-'))
                return host;
            //return host;
        }
        if (host && host.parentElement) {
            return getHost(host.parentElement, tocoho, ish);
        }
    }
    if (ish) {
        host = self.parentElement;
        if (host !== null && host.localName.includes('-'))
            return host;
        while (host && !host.localName.includes('-')) {
            host = host.parentElement;
            if (host !== null && host.localName.includes('-') && !host.shadowRoot === null)
                return host;
        }
    }
    host = self.getRootNode().host;
    if (host === undefined) {
        return null;
    }
    return host;
}
