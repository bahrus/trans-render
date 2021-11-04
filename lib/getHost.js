export function getHost(self, tocoho) {
    let host;
    if (tocoho) {
        host = (self.parentElement || self).closest('[data-is-hostish]');
        if (host)
            return host;
    }
    host = self.getRootNode().host;
    if (host === undefined) {
        host = self.parentElement;
        while (host && !host.localName.includes('-')) {
            host = host.parentElement;
        }
    }
    return host;
}
