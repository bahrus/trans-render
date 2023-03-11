export async function findRealm(self, scope) {
    if (typeof scope === 'string') {
        switch (scope) {
            case 's':
            case 'self':
                return self;
            case 'p':
            case 'parent':
                return self.parentElement;
            case 'pes':
            case 'previousElementSibling':
                return self.previousElementSibling;
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
                scope = await sift(scope);
        }
    }
    const scopeHead = scope[0];
    switch (scopeHead) {
        case 'c':
        case 'closest': {
            const arg = scope[1];
            return self.closest(arg);
        }
        case 'previous': {
            const css = scope[1];
            const { prevSearch } = await import('./prevSearch.js');
            return prevSearch(self, css);
        }
        case 'us':
        case 'upSearch': {
            const css = scope[1];
            const { upSearch } = await import('./upSearch.js');
            return upSearch(self, css);
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
async function getSecondArg(test) {
    const { getQuery } = await import('./specialKeys.js');
    return getQuery(test.groups.camelQry).query;
}
async function sift(scopeString) {
    let test = rePrev.exec(scopeString);
    if (test !== null)
        return ['previous', await getSecondArg(test)];
    test = reUpSearch.exec(scopeString);
    if (test !== null)
        return ['us', await getSecondArg(test)];
    test = reClosestOrHost.exec(scopeString);
    if (test !== null)
        return ['coh', await getSecondArg(test)];
    test = reClosestOrRootNode.exec(scopeString);
    if (test !== null)
        return ['corn', await getSecondArg(test)];
    test = reClosest.exec(scopeString);
    if (test !== null)
        return ['c', await getSecondArg(test)];
    throw 'sift.NI';
}
const rePrev = /^previous(?<camelQry>w+)/;
const reUpSearch = /^upSearchFor(?<camelQry>w+)/;
const reClosestOrHost = /^closest(?<camelQry>w+)OrHost/;
const reClosestOrRootNode = /^closest(?<camelQry>w+)OrRootNode/;
const reClosest = /^closest(?<camelQry>w+)/;
