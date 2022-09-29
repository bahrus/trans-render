export async function findRealm(self, scope) {
    if (typeof scope === 'string') {
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
                const closest = arg === true ? '[itemscope]' : arg;
            }
        }
    }
}
