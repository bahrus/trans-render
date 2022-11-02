import { DefineArgs, LogicOp, PropInfo, HasPropChangeQueue, Action, PropInfoTypes, PropChangeInfo, PropChangeMoment, ListOfLogicalExpressions, TRElementProps, PropChangeMethod, TRElementActions, WCConfig, IActionProcessor } from '../lib/types.js';
export { Action, PropInfo, TRElementActions, TRElementProps, WCConfig, IActionProcessor as IHasPostHoc} from '../lib/types.js';
import { def } from '../lib/def.js';
import {IAddMixins, DefineArgsWithServices, ICreateCustomElement, IAttrChgCB} from './types';
import {am, acb} from './const.js';
import { ResolvableService } from './ResolvableService.js';


export class CE extends ResolvableService{
    constructor(public args: DefineArgsWithServices){
        super();
        this.#evalConfig(this);
        this.#do(args);
    }

    async #do(args: DefineArgsWithServices){
        if(args.serviceClasses === undefined){
            args.serviceClasses = {};
            const {serviceClasses} = args;
            if(args.mixins || args.superclass){
                const {AddMixins} = await import('./AddMixins.js');
                serviceClasses.addMixins = AddMixins;
            }
            const {CreatePropInfos} = await import('./CreatePropInfos');
            serviceClasses.createPropInfos  = CreatePropInfos;
            const {AddProps} = await import('./AddProps.js');
            serviceClasses.addProps = AddProps;
            const config = args.config as WCConfig;
            if(config.actions !== undefined){
                const {ConnectActions} = await import('./ConnectActions.js');
                serviceClasses.connectActions = ConnectActions;
            }
        }
        await this.#createServices(args);


    }

    async #createServices(args: DefineArgsWithServices){
        const {serviceClasses} = args;
        const {addMixins, addProps, createPropInfos, connectActions} = serviceClasses;
        args.services = {
            addMixins: addMixins ? new addMixins(args) : undefined,
            addProps: new addProps!(args),
            createPropInfos: new createPropInfos!(args),
            createCustomEl: this,
            connectActions: connectActions ? new connectActions(args) : undefined,
        }
        await this.#createClass(args);
    }

    async #createClass(args: DefineArgsWithServices){
        const {services} = args;
        const {createPropInfos, addMixins} = services;
        await createPropInfos.resolve();
        const ext = addMixins?.ext || HTMLElement;
        const config = args.config as WCConfig;
        const {tagName, formAss} = config;
        class newClass extends (<any>ext){
            static is = tagName; 
            static observedAttributes = createPropInfos.getAttrNames(ext);
            static ceDef = args;
            static formAssociated = formAss;
            attributeChangedCallback(name: string, oldVal: string, newVal: string){
                if(super.attributeChangedCallback) super.attributeChangedCallback(name, oldVal, newVal);
                services.createCustomEl.dispatchEvent(new CustomEvent(acb, {
                    detail: {
                        instance: this as any as HTMLElement,
                        name,
                        oldVal,
                        newVal,
                    }  as IAttrChgCB
                    
                }))
            }
        }
        this.resolved = true;
    }

    async #evalConfig({args}: this){
        if(args === undefined) return;
        const {config} = args;
        if(typeof config != 'function') return;
        args.config = (await config()).default;
    }



}

export interface CE extends ICreateCustomElement{}