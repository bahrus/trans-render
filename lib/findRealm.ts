import {Scope} from './types';

export async function findRealm(self: Element, scope: Scope){
    if(typeof scope === 'string'){
        switch(scope){
            case 's':
            case 'self':
                return self;
            case 'p':
            case 'parent':
                return self.parentElement;
            case 'rn':
            case 'rootNode':
                return self.getRootNode() as Document | ShadowRoot;
        }
    }else{
        const scopeHead = scope[0];
        const arg = scope[1];
        switch(scopeHead){
            case 'c':
            case 'closest':
                return self.closest(arg);
            case 'us':
            case 'upSearch':
                const {upSearch} = await import('./upSearch.js');
                return upSearch(self, arg);
        }
    }
}