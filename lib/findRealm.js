export async function findRealm(self, scope) {
    if (typeof scope === 'string') { //TODO:  do dynamic import for each condition
        switch (scope) {
            case 's':
            case 'self':
                return self;
            case 'p':
            case 'parent':
                return self.parentElement;
            case 'rn':
            case 'rootNode':
                const { onConnected } = await import('./onConnected');
                await onConnected(self);
                return self.getRootNode();
            case 'h':
            case 'host':
                const { getHost } = await import('./getHost.js');
                return await getHost(self);
        }
    }
    else {
        const scopeHead = scope[0];
        switch (scopeHead) {
            case 'c':
            case 'closest': {
                const arg = scope[1];
                return self.closest(arg);
            }
            case 'us':
            case 'upSearch': {
                const arg = scope[1];
                const { upSearch } = await import('./upSearch.js');
                return upSearch(self, arg);
            }
            case 'coh':
            case 'closestOrHost': {
                const arg = scope[1];
                const closestQ = arg === true ? '[itemscope]' : arg;
                const closest = self.closest(closestQ);
                if (closest === null) {
                    const { getHost } = await import('./getHost.js');
                    return await getHost(self);
                }
                else {
                    return closest;
                }
            }
            case 'corn':
            case 'closestOrRootNode':
                const arg = scope[1];
                const closestQ = arg === true ? '[itemscope]' : arg;
                const closest = self.querySelector(closestQ);
                if (closest === null) {
                    const { onConnected } = await import('./onConnected');
                    await onConnected(self);
                    return self.getRootNode();
                }
                else {
                    return closest;
                }
        }
    }
}
