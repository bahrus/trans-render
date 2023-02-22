import {Scope, TemplMgmtProps} from './types';

export async function findRealm(self: Element, scope: Scope){
    if(typeof scope === 'string'){ 
        switch(scope){
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
                return self.getRootNode() as Document | ShadowRoot;
            case 'h':
            case 'host':
                const {getHost} = await import('./getHost.js');
                return await getHost(self);
            case 'sd':
            case 'shadowDOM':
                //a little bit of playing favorites with TemplMgmt mixin -- this allows performing transforms prior to appending
                //into the shadow dom.
                return (self as any as TemplMgmtProps).clonedTemplate || self.shadowRoot; 
                 
        }
    }else{
        const scopeHead = scope[0];
        switch(scopeHead){
            case 'c':
            case 'closest':{
                const arg = scope[1];
                return self.closest(arg);
            }
            case 'us':
            case 'upSearch':{
                const arg = scope[1];
                const {upSearch} = await import('./upSearch.js');
                return upSearch(self, arg as string);
            }
            case 'coh':
            case 'closestOrHost':{
                const arg = scope[1];
                const closestQ = arg === true ? '[itemscope]' : arg as string;
                const closest = self.closest(closestQ);
                if(closest === null){
                    const {getHost} = await import('./getHost.js');
                    return await getHost(self);
                }else{
                    return closest;
                }
            }
            case 'corn':
            case 'closestOrRootNode':
                const arg = scope[1];
                const closestQ = arg === true ? '[itemscope]' : arg as string;
                const closest = self.querySelector(closestQ);
                if(closest === null){
                    return self.getRootNode() as Document | ShadowRoot;
                }else{
                    return closest;
                }

        }
    }
}