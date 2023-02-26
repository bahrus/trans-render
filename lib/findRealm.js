export async function findRealm(self, scope) {
    if (typeof scope === 'string') {
        switch (scope) {
            case 's':
            case 'self':
                return self;
            case 'p':
            case 'parent':
                return self.parentElement;
            case 'porn':
            case 'parentOrRootNode':
                return self.parentElement || self.getRootNode();
            case 'rn':
            case 'rootNode':
                return self.getRootNode();
            case 'h':
            case 'host':
                const { getHost } = await import('./getHost.js');
                return await getHost(self);
            case 'sd':
            case 'shadowDOM':
                //a little bit of playing favorites with TemplMgmt mixin -- this allows performing transforms prior to appending
                //into the shadow dom.
                return self.clonedTemplate || self.shadowRoot;
            default:
                const { getQuery } = await import('./specialKeys.js');
                let test = reUpSearch.exec(scope);
                if (test !== null) {
                    scope = ['us', getQuery(test.groups.camelQry).query];
                }
                else {
                    test = reClosestOrHost.exec(scope);
                    if (test !== null) {
                        scope = ['coh', getQuery(test.groups.camelQry).query];
                    }
                    else {
                        test = reClosestOrRootNode.exec(scope);
                        if (test !== null) {
                            scope = ['corn', getQuery(test.groups.camelQry).query];
                        }
                        else {
                            test = reClosest.exec(scope);
                            if (test !== null) {
                                scope = ['c', getQuery(test.groups.camelQry).query];
                            }
                            else {
                                throw 'fR.NI';
                            }
                        }
                    }
                }
        }
    }
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
            const closest = self.closest(scope[1]);
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
            const closest = self.querySelector(scope[1]);
            if (closest === null) {
                return self.getRootNode();
            }
            else {
                return closest;
            }
    }
}
const reUpSearch = /^upSearchFor(?<camelQry>w+)/;
const reClosestOrHost = /^closest(?<camelQry>w+)OrHost/;
const reClosestOrRootNode = /^closest(?<camelQry>w+)OrRootNode/;
const reClosest = /^closest(?<camelQry>w+)/;
