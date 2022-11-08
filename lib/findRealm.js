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
                return self.getRootNode();
            case 'h':
            case 'host':
                const { getHost } = await import('./getHost.js');
                return await getHost(self);
            case 'sd':
            case 'shadowDOM':
                return self.shadowRoot || self.clonedTemplate; //a little bit of playing favorites with TemplMgmt mixin -- this allows performing transforms prior to appending
            //into the shadow dom. 
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
                    return self.getRootNode();
                }
                else {
                    return closest;
                }
        }
    }
}
