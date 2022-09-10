import { RenderContext, MatchRHS} from 'trans-render/lib/types';
import {ITx} from './types';
import {getHost} from 'trans-render/lib/getHost.js';

export class Tx implements ITx{
    #ctx: RenderContext
    #realm: Element | ShadowRoot;
    constructor(public host: any, public realmCitizen: Element, match: {[key: string]: MatchRHS}){
        // const target = pram.transformFromClosest !== undefined ?
        //     proxy.closest(pram.transformFromClosest)
        //     : host.shadowRoot || host!;
        const rn = (getHost(realmCitizen, true) || document) as HTMLElement;
        this.#realm = rn!.shadowRoot || rn!;
        this.#ctx = {
            match,
            host,
            initiator: realmCitizen
        };
    }

    async transform(): Promise<void> {
        const {DTR} = await import('trans-render/lib/DTR.js');
        await DTR.transform(this.#realm, this.#ctx);
    }

}