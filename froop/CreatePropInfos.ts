import {PropInfo, WCConfig, Action, PropInfoTypes} from '../lib/types';
import {DefineArgsWithServices, ICreatePropInfos, IAttrChgCB, INewPropBag} from './types';
import {acb, npb, r, mse} from './const.js';
import { ResolvableService } from './ResolvableService.js';

export class CreatePropInfos extends ResolvableService{
    constructor(public args: DefineArgsWithServices){
        super();
        args.main!.addEventListener(mse, () => {
            this.#do(args);
        }, {once: true});

    }
    async #do(args: DefineArgsWithServices){
        const config  = args.config as WCConfig;
        const props: {[key: string]: PropInfo} = {};
        const defaults = {...args.complexPropDefaults, ...config.propDefaults} as any;
        const nonDryProps = new Set<string>();
        for(const key in defaults){
            const prop: PropInfo = {...defaultProp};
            this.#setType(prop, defaults[key]);
            props[key] = prop;
        }
        const explicitProps = config.propInfo;
        if(explicitProps !== undefined){
            for(const key in explicitProps){
                if(props[key] === undefined){
                    const prop: PropInfo = {...defaultProp};
                    props[key] = prop;
                }
                const prop = props[key];
                Object.assign(prop, explicitProps[key]);
                if(!prop.dry) nonDryProps.add(key);
            }
        }
        const actions = config.actions;
        if(actions !== undefined){
            //const {getProps} = await import('../froop/getProps.js')
            for(const methodName in actions){
                const action = actions[methodName] as string | Action;
                //const typedAction = (typeof action === 'string') ? {ifAllOf:[action]} as Action : action! as Action;
                const upon = this.getPropsFromAction(action);
                for(const dependency of upon){
                    if(props[dependency] === undefined){
                        const prop: PropInfo = {...defaultProp};
                        props[dependency] = prop;
                    }
                }
            }
        }
        //await this.api(args, props);
        this.nonDryProps = nonDryProps;
        this.propInfos = props;
        this.allPropNames = Object.keys(props);
        
        const {services} = args;
        const {createCustomEl, addProps} = services!;
        createCustomEl.addEventListener(acb, async e => {
            const acbE = (e as CustomEvent).detail as IAttrChgCB;
            const {instance, name, newVal, oldVal} = acbE;
            const {doAttr} = await import('./doAttr.js');
            await doAttr(acbE, props, defaults);
        });
        addProps.addEventListener(npb, e => {
            const inpb = (e as CustomEvent).detail as INewPropBag;
            const {instance} = inpb;
            this.#propUp(instance, this.allPropNames, defaults);
        });
        this.resolved = true;
        
    }

    #setType(prop: PropInfo, val: any){
        if(val !== undefined){
            if(val instanceof RegExp){
                prop.type = 'RegExp';
            }else{
                let t: string = typeof(val);
                t = t[0].toUpperCase() + t.substr(1);
                prop.type = t as PropInfoTypes;
            }

        }
    }

    /**
     * Needed for asynchronous loading
     * @param props Array of property names to "upgrade", without losing value set while element was Unknown
     * @param defaultValues:   If property value not set, set it from the defaultValues lookup
     * @private
     */
    #propUp<T>(instance: HTMLElement, props: string[], defaultValues?: T){
        for(const prop of props){
            let value = (<any>instance)[prop];
            if(value === undefined && defaultValues !== undefined){
                value = (<any>defaultValues)[prop];
            }
            if (instance.hasOwnProperty(prop)) {
                delete (<any>instance)[prop];
            }
            //some properties are read only.
            try{(<any>instance)[prop] = value;}catch{}
        }
    }

    async getAttrNames(ext: any){
        const returnArr: string[] = ext.observedAttributes || [];
        const {propInfos} = this;
        const {camelToLisp} = await import('../lib/camelToLisp.js');
        for(const key in propInfos){
            const prop = propInfos[key];
            if(prop.parse){
                returnArr.push(camelToLisp((key)));
            }
        }
        returnArr.push('defer-hydration');
        return returnArr;
    }

    #actionToPropMap = new Map<string | Action, Set<string>>();
    getPropsFromAction(action: string | Action){
        const test = this.#actionToPropMap.get(action);
        if(test !== undefined) return test;
        const returnObj = typeof(action) === 'string' ? new Set<string>([action]) : new Set<string>([
            ...(action.ifAllOf || []) as string[], 
            ...(action.ifKeyIn || []) as string[], 
            ...(action.ifNoneOf || []) as string[],
            ...(action.ifEquals || []) as string[],
            ...(action.ifAtLeastOneOf || []) as string[]
        ]);
        this.#actionToPropMap.set(action, returnObj);
        return returnObj;
    }
}

export interface CreatePropInfos extends ICreatePropInfos{}


const defaultProp: PropInfo = {
    type: 'Object',
    dry: true,
    parse: true,
};