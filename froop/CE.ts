import { DefineArgs, LogicOp, PropInfo, HasPropChangeQueue, Action, PropInfoTypes, PropChangeInfo, PropChangeMoment, ListOfLogicalExpressions, TRElementProps, PropChangeMethod, TRElementActions, WCConfig, IActionProcessor } from '../lib/types.js';
export { Action, PropInfo, TRElementActions, TRElementProps, WCConfig, IActionProcessor as IHasPostHoc} from '../lib/types.js';
import { def } from '../lib/def.js';
import {IAddMixins, CEArgs, ICreateCustomElement, IAttrChgCB, IConnectedCB, IDisconnectedCB} from './types';
import {acb, ccb, dcb, mse} from './const.js';
import { ReslvSvc } from './ReslvSvc.js';


export class CE<TProps = any, TActions = TProps> extends ReslvSvc{
    constructor(public args: CEArgs<TProps, TActions>){
        super();
        this.#evalConfig(args);
        this.#do(args);
    }

    async #do(args: CEArgs){
        if(args.serviceClasses === undefined){
            await this.addSvcClasses(args);
        }
        await this.#createServices(args);

    }

    /**
     * 
     * @param args 
     * @overridable
     */
    async addSvcClasses(args: CEArgs){
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

    async #createServices(args: CEArgs){
        args.main = this;
        this.addSvcs(args);
        this.dispatchEvent(new Event(mse))
        await this.#createClass(args);
    }
    /**
     * 
     * @param args 
     * @overridable
     */
    async addSvcs(args: CEArgs){
        const {serviceClasses} = args;
        const {addMixins, addProps, createPropInfos, connectActions} = serviceClasses!;
        args.services = {
            createCustomEl: this,
            addMixins: addMixins ? new addMixins(args) : undefined,
            addProps: new addProps!(args),
            createPropInfos: new createPropInfos!(args),
            connectActions: connectActions ? new connectActions(args) : undefined,
        };
    }

    async #createClass(args: CEArgs){
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
                //console.log('connectedCallback');
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
        this.resolved = true;
        const {addProps, connectActions} = services!;
        await addProps.resolve();
        //await connectActions?.resolve();
        
        def(newClass);
        
    }

    async #evalConfig(args: CEArgs){
        if(args === undefined) return;
        const {config} = args;
        if(typeof config != 'function') return;
        args.config = (await config()).default;
    }

    async resolveInstanceSvcs(args: CEArgs, instance: any){
        const {services} = args;
        const {InstResSvc} = await import('./InstResSvc.js');
        for(const svc of Object.values(services!)){
            if(svc instanceof InstResSvc){
                await svc.instanceResolve(instance);
            }
        }

    }

}

export interface CE extends ICreateCustomElement{}