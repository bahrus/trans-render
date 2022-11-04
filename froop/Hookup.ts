import {WCConfig} from '../lib/types';
import { InstResSvc } from "./InstResSvc.js";
import {npb, r, mse} from './const.js';
import { CEArgs, IHookup, INewPropBag as INewPropagator } from './types';

/**
 * Connects the prop change subscription via Propagate observer to the corresponding actions
 */
export class Hookup extends InstResSvc {
    constructor(public args: CEArgs){
        super();
        args.definer!.addEventListener(mse, () => {
            this.#do(args);
        }, {once: true});

    }
    async #do(args: CEArgs){
        
        const {services} = args;
        const {propify} = services!;
        
        propify.addEventListener(npb, async e => {
            const propagatorEvent = (e as CustomEvent).detail as INewPropagator;
            const {instance, propBag} = propagatorEvent;
            const {trigger} = await import('./trigger.js');
            //console.log({instance, propBag});
            trigger(instance, propBag, args);
            this.instanceResolved = instance;
        });
        await propify.resolve();
        this.resolved = true;
    }
}

export interface Hookup extends IHookup{}