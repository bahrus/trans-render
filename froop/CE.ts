import { DefineArgs, LogicOp, PropInfo, HasPropChangeQueue, Action, PropInfoTypes, PropChangeInfo, PropChangeMoment, ListOfLogicalExpressions, TRElementProps, PropChangeMethod, TRElementActions, WCConfig, IActionProcessor } from '../lib/types.js';
export { Action, PropInfo, TRElementActions, TRElementProps, WCConfig, IActionProcessor as IHasPostHoc} from '../lib/types.js';
import { def } from '../lib/def.js';
import {IAddMixins, DefineArgsWithServices, ICreateCustomElement, IAttrChgCB, IConnectedCB, IDisconnectedCB} from './types';
import {acb, ccb, dcb} from './const.js';
import { ResolvableService } from './ResolvableService.js';


export class CE<TProps = any, TActions = TProps> extends ResolvableService{
    constructor(public args: DefineArgsWithServices<TProps, TActions>){
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
            const {CreatePropInfos} = await import('./CreatePropInfos.js');
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
        const {addMixins, addProps, createPropInfos, connectActions} = serviceClasses!;
        args.main = this;
        args.services = {
            createCustomEl: this,
            addMixins: addMixins ? new addMixins(args) : undefined,
            addProps: new addProps!(args),
            createPropInfos: new createPropInfos!(args),
            connectActions: connectActions ? new connectActions(args) : undefined,
        };
        this.resolved = true;
        await this.#createClass(args);
    }

    async #createClass(args: DefineArgsWithServices){
        const {services} = args;
        const {createPropInfos, addMixins} = services!;
        await createPropInfos.resolve();
        const ext = addMixins?.ext || HTMLElement;
        const config = args.config as WCConfig;
        const {tagName, formAss} = config;
        const observedAttributes = await createPropInfos.getAttrNames(ext);
        class newClass extends (<any>ext){
            static is = tagName; 
            static observedAttributes = observedAttributes;
            static ceDef = args;
            static formAssociated = formAss;
            attributeChangedCallback(name: string, oldVal: string, newVal: string){
                if(super.attributeChangedCallback) super.attributeChangedCallback(name, oldVal, newVal);
                services!.createCustomEl.dispatchEvent(new CustomEvent(acb, {
                    detail: {
                        instance: this as any as HTMLElement,
                        name,
                        oldVal,
                        newVal,
                    }  as IAttrChgCB
                    
                }))
            }

            connectedCallback(){
                if(super.connectedCallback) super.connectedCallback();
                services!.createCustomEl.dispatchEvent(new CustomEvent(ccb, {
                    detail: {
                        instance: this as any as HTMLElement,
                    } as IConnectedCB
                }));
            }

            disconnectedCallback(){
                if(super.disconnectedCallback) super.disconnectedCallback();
                services!.createCustomEl.dispatchEvent(new CustomEvent(dcb, {
                    detail: {
                        instance: this as any as HTMLElement
                    } as IDisconnectedCB
                }));
            }
        }
        this.custElClass = newClass as any as {new(): HTMLElement}
        def(newClass);
        
    }

    async #evalConfig({args}: this){
        if(args === undefined) return;
        const {config} = args;
        if(typeof config != 'function') return;
        args.config = (await config()).default;
    }



}

export interface CE extends ICreateCustomElement{}