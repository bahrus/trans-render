export async function getHost(self, tocoho) {
    let host;
    if (tocoho) {
        const closest = tocoho === true ? '[itemscope]' : tocoho;
        host = (self.parentElement || self).closest(closest);
        if (host)
            return host;
    }
    const { onConnected } = await import('./onConnected');
    await onConnected(self);
    host = self.getRootNode().host;
    if (host === undefined) {
        host = self.parentElement;
        while (host && !host.localName.includes('-')) {
            host = host.parentElement;
        }
    }
    return host;
}
