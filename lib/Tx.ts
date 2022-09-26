import { RenderContext, MatchRHS, TransformScope} from 'trans-render/lib/types';
import {ITx} from './types';

export class Tx implements ITx{
    #ctx: RenderContext
    #realm: WeakRef<Element | ShadowRoot | DocumentFragment> | undefined;
    constructor(host: any, public realmCitizen: Element, match: {[key: string]: MatchRHS}, public transformScope: TransformScope){
        this.#ctx = {
            match,
            host,
            initiator: realmCitizen
        };
    }

    async #getRealm(){
        if(this.#realm !== undefined){
            const deref = this.#realm.deref();
            if(deref !== undefined) return deref;
        }
        const {transformScope, realmCitizen} = this;
        if(transformScope.parent){
            const parent = realmCitizen.parentElement;
            if(parent !== null){
                this.#realm = new WeakRef(parent);
                return parent;
            }
        }
        const {closest} = transformScope;
        if(closest !== undefined){
            const nearest = realmCitizen.closest(closest);
            return realmCitizen.closest(closest);
        }
        const {getHost} = await import('trans-render/lib/getHost.js');
        const rn = (getHost(realmCitizen, true) || document) as Element | DocumentFragment;
        this.#realm = new WeakRef(rn);
        return rn;
    }

    async transform(): Promise<void> {
        const {DTR} = await import('trans-render/lib/DTR.js');
        await DTR.transform(await this.#getRealm() as any as DocumentFragment, this.#ctx);
    }

}