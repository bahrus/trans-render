import { RenderContext, MatchRHS, Scope} from 'trans-render/lib/types';
import {ITx} from './types';

/**
 * Purpose:  Manage repeated transforms for scenario where transform is externally triggered as opposed to being auto triggered via subscribe.
 */
export class Tx implements ITx{
    #ctx: RenderContext;
    #realm: WeakRef<Element | ShadowRoot | DocumentFragment | Document> | undefined;
    #scope: Scope;
    constructor(host: any, realmCitizen: Element, match: {[key: string]: MatchRHS}, scope: Scope){
        this.#ctx = {
            match,
            host,
            initiator: realmCitizen
        };
        this.#scope = scope;
    }

    async #getRealm(){
        if(this.#realm !== undefined){
            const deref = this.#realm.deref();
            if(deref !== undefined) return deref;
        }
        const {findRealm} = await import('./findRealm.js');
        const rn = await findRealm(this.#ctx.initiator!, this.#scope);
        if(!rn) throw '404';
        this.#realm = new WeakRef(rn);
        return rn;
    }

    async transform(): Promise<void> {
        const {DTR} = await import('trans-render/lib/DTR.js');
        await DTR.transform(await this.#getRealm() as any as DocumentFragment, this.#ctx);
    }

}