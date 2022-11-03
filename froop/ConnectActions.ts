import {WCConfig} from '../lib/types';
import { InstResSvc } from "./InstResSvc.js";
import {npb, r, mse} from './const.js';
import { DefineArgsWithServices, IConnectActions, INewPropBag } from './types';

/**
 * Connects the prop change subscription via PropBag observer to the corresponding actions
 */
export class ConnectActions extends InstResSvc {
    constructor(public args: DefineArgsWithServices){
        super();
        args.main!.addEventListener(mse, () => {
            this.#do(args);
        }, {once: true});

    }
    async #do(args: DefineArgsWithServices){
        
        const {services} = args;
        const {addProps} = services!;
        await addProps.resolve();
        addProps.addEventListener(npb, async e => {
            const propBagEvent = (e as CustomEvent).detail as INewPropBag;
            const {instance, propBag} = propBagEvent;
            const {hookupActions} = await import('./hookupActions.js');
            //console.log({instance, propBag});
            await hookupActions(instance, propBag, args);
            this.instanceResolved = instance;
        });
        this.resolved = true;
    }
}

export interface ConnectActions extends IConnectActions{}