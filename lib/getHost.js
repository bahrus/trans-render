export function getHost(self) {
    let host = self.getRootNode().host;
    if (host === undefined) {
        host = self.parentElement;
        while (host && !host.localName.includes('-')) {
            host = host.parentElement;
        }
    }
    return host;
}
