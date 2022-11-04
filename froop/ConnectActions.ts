import {WCConfig} from '../lib/types';
import { InstResSvc } from "./InstResSvc.js";
import {npb, r, mse} from './const.js';
import { CEArgs, IConnectActions, INewPropBag as INewPropagator } from './types';

/**
 * Connects the prop change subscription via Propagate observer to the corresponding actions
 */
export class ConnectActions extends InstResSvc {
    constructor(public args: CEArgs){
        super();
        args.main!.addEventListener(mse, () => {
            this.#do(args);
        }, {once: true});

    }
    async #do(args: CEArgs){
        
        const {services} = args;
        const {propify} = services!;
        await propify.resolve();
        propify.addEventListener(npb, async e => {
            const propBagEvent = (e as CustomEvent).detail as INewPropagator;
            const {instance, propBag} = propBagEvent;
            const {trigger} = await import('./trigger.js');
            //console.log({instance, propBag});
            trigger(instance, propBag, args);
            this.instanceResolved = instance;
        });
        this.resolved = true;
    }
}

export interface ConnectActions extends IConnectActions{}