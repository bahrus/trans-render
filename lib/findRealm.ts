import {Scope, ScopeTuple, } from './types';
import {TemplMgmtProps} from './mixins/types';

export async function findRealm(self: Element, scope: Scope){
    if(typeof scope === 'string'){ 
        switch(scope){
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
            case 'parentOrRootNode':{
                const test = self.parentElement || self.getRootNode();
                if(test instanceof Element && test.matches('.stream-orator-wrapper,[be-written]')) {
                    return findRealm(test, scope);
                }
                return test;
            }
                
            case 'hostish':{
                const {getHost} = await import('./getHost.js');
                return await getHost(self, false, true);
            }
                
            case 'rn':
            case 'rootNode':
                return self.getRootNode() as Document | ShadowRoot;
            case 'h':
            case 'host':{
                const {getHost} = await import('./getHost.js');
                return await getHost(self);
            }
                
            case 'sd':
            case 'shadowDOM':
                //a little bit of playing favorites with TemplMgmt mixin -- this allows performing transforms prior to appending
                //into the shadow dom.
                return (self as any as TemplMgmtProps).clonedTemplate || self.shadowRoot; 
            default:
                scope = await sift(scope);
        }
    }
    const scopeHead = scope[0];
    switch(scopeHead){
        case 'c':
        case 'closest':{
            const arg = scope[1];
            return self.closest(arg);
        }
        case 'previous':{
            const css = scope[1];
            const {prevSearch} = await import('./prevSearch.js');
            return prevSearch(self, css);
        }
        case 'us':
        case 'upSearch':{
            const css = scope[1];
            const {upSearch} = await import('./upSearch.js');
            return upSearch(self, css);
        }
        case 'coh':
        case 'closestOrHost':{
            const closest = self.closest(scope[1]);
            if(closest === null){
                const {getHost} = await import('./getHost.js');
                return await getHost(self);
            }else{
                return closest;
            }
        }
        case 'corn':
        case 'closestOrRootNode':{
            const closest = self.closest(scope[1]);
            if(closest === null){
                return self.getRootNode() as Document | ShadowRoot;
            }else{
                return closest;
            }
        }
        case 'wrn':
        case 'withinRootNode':
            return (self.getRootNode() as DocumentFragment).querySelector(scope[1]);
        case 'wi':
        case 'within':{
            const css = scope[1];
            const {upSearch} = await import('./upSearch.js');
            const perimeter = upSearch(self, css);
            const subCss = scope[2];
            return perimeter?.querySelector(subCss);
        }

        case 'wis':
        case 'withinItemScope':{
            const isFreeForm = scope[2] === true;
            const closest = self.closest('[itemscope]') || (self.getRootNode() as DocumentFragment);
            if(closest === null) return null;
            //TODO use @scope donut hole.
            return isFreeForm ? closest.querySelector(scope[1]) : closest.querySelector(`[itemprop="${scope[1]}"]`);
        }
        case 'wf':
        case 'withinForm':{
            let closest = (self.closest('form') || self.getRootNode()) as any as DocumentFragment;
            if(closest === null) return null;
            return closest.querySelector(`[name="${scope[1]}"]`);
        }
    }
    
}

async function getSecondArg(test: RegExpExecArray){
    const {getQuery} = await import('./specialKeys.js');
    return getQuery(test.groups!.camelQry).query;
}

async function sift(scopeString: Scope & string) : Promise<ScopeTuple> {
    
    let test = rePrev.exec(scopeString);
    if(test !== null) return ['previous', await getSecondArg(test)];
    test = reUpSearch.exec(scopeString);
    if(test !== null) return ['us', await getSecondArg(test)];
    test = reClosestOrHost.exec(scopeString);
    if(test !== null) return ['coh', await getSecondArg(test)];
    test = reClosestOrRootNode.exec(scopeString);
    if(test !== null) return ['corn', await getSecondArg(test)];
    test = reClosest.exec(scopeString);
    if(test !== null) return ['c', await getSecondArg(test)];
    test = reWithinRootNode.exec(scopeString);
    if(test !== null) return ['wrn', await getSecondArg(test)];
    test = reWithinItemScope.exec(scopeString);
    if(test !== null) return ['wis', await getSecondArg(test)];
    test = reWithinForm.exec(scopeString);
    if(test !== null) return ['wf', await getSecondArg(test)];
    throw 'sift.NI';
}

const rePrev = /^previous(?<camelQry>\w+)/;
const reUpSearch = /^upSearchFor(?<camelQry>\w+)/;
const reClosestOrHost = /^closest(?<camelQry>\w+)OrHost/;
const reClosestOrRootNode = /^closest(?<camelQry>\w+)OrRootNode/;
const reClosest = /^closest(?<camelQry>\w+)/;
const reWithinRootNode = /(?<camelQry>\w+)(?<!\\)WithinRootNode/;
const reWithinItemScope = /(?<camelQry>\w+)(?<!\\)WithinItemScope/;
const reWithinForm = /(?<camelQry>\w+)(?<!\\)WithinForm/;