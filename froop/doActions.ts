import {WCConfig} from '../lib/types';
import { ResolvableService } from "./ResolvableService";
import {npb} from './const.js';
import { DefineArgsWithServices, IConnectActions, INewPropBag } from './types';


export class ConnectActions extends ResolvableService {
    constructor(public args: DefineArgsWithServices){
        super();
        this.#do(args);

    }
    async #do(args: DefineArgsWithServices){
        const config  = args.config as WCConfig;
        
        const {services} = args;
        const {addProps} = services;
        await addProps.resolve();
        addProps.addEventListener(npb, e => {
            const propBagEvent = (e as CustomEvent).detail as INewPropBag;
            
        });
    }
}

export interface ConnectActions extends IConnectActions{}