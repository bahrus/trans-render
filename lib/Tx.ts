import { RenderContext, MatchRHS, Scope, CSSSelectorBeHavingMap} from 'trans-render/lib/types';
import {ITx, Matches} from './types';

/**
 * Purpose:  Manage repeated transforms for scenario where transform is externally triggered as opposed to being auto triggered via subscribe.
 */
export class Tx implements ITx{
    #ctx: RenderContext;
    #realm: WeakRef<Element | ShadowRoot | DocumentFragment | Document | Node | EventTarget> | undefined;
    #scope: Scope;
    constructor(host: any, realmCitizen: Element, match: Matches | undefined, scope: Scope){
        this.#ctx = {
            match,
            host,
            $0: realmCitizen
        };
        this.#scope = scope;
    }

    set match(nv: Matches){
        this.#ctx.match = nv;
    }

    set make(nv: CSSSelectorBeHavingMap){
        this.#ctx.make = nv;
    }

    set scope(nv: Scope){
        if(this.#scope !== nv){
            this.#realm = undefined;
        }
        this.#scope = nv;
    }

    async #getRealm(){
        if(this.#realm !== undefined){
            const deref = this.#realm.deref();
            if(deref !== undefined) return deref;
        }
        const {findRealm} = await import('./findRealm.js');
        const rn = await findRealm(this.#ctx.$0!, this.#scope);
        if(!rn) throw '404';
        this.#realm = new WeakRef(rn);
        return rn;
    }

    async transform(): Promise<void> {
        const {DTR} = await import('trans-render/lib/DTR.js');
        await DTR.transform(await this.#getRealm() as any as DocumentFragment, this.#ctx);
    }

}