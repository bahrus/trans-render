import {WCConfig} from '../lib/types';
import { ResolvableService } from "./ResolvableService.js";
import {npb, r, mse} from './const.js';
import { DefineArgsWithServices, IConnectActions, INewPropBag } from './types';


export class ConnectActions extends ResolvableService {
    constructor(public args: DefineArgsWithServices){
        super();
        args.main!.addEventListener(mse, () => {
            this.#do(args);
        }, {once: true});

    }
    async #do(args: DefineArgsWithServices){
        const config  = args.config as WCConfig;
        
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