import {PropInfo, WCConfig, Action, PropInfoTypes} from '../lib/types';
import {DefineArgsWithServices, ICreatePropInfos, IAttrChgCB} from './types';
import {acb} from './const.js';
import { ResolvableService } from './ResolvableService.js';

export class CreatePropInfos extends ResolvableService{
    constructor(public args: DefineArgsWithServices){
        super();
        this.#do(args);

    }
    async #do(args: DefineArgsWithServices){
        const config  = args.config as WCConfig;
        const props: {[key: string]: PropInfo} = {};
        const defaults = {...args.complexPropDefaults, ...config.propDefaults} as any;
        for(const key in defaults){
            const prop: PropInfo = {...defaultProp};
            this.setType(prop, defaults[key]);
            props[key] = prop;
        }
        const specialProps = config.propInfo;
        if(specialProps !== undefined){
            for(const key in specialProps){
                if(props[key] === undefined){
                    const prop: PropInfo = {...defaultProp};
                    props[key] = prop;
                }
                const prop = props[key];
                Object.assign(prop, specialProps[key]);
            }
        }
        const actions = config.actions;
        if(actions !== undefined){
            const {getProps} = await import('../froop/getProps.js')
            for(const methodName in actions){
                const action = actions[methodName];
                const typedAction = (typeof action === 'string') ? {ifAllOf:[action]} as Action : action! as Action;
                const upon = getProps(typedAction);
                for(const dependency of upon){
                    if(props[dependency] === undefined){
                        const prop: PropInfo = {...defaultProp};
                        props[dependency] = prop;
                    }
                }
            }
        }
        //await this.api(args, props);
        this.propInfos = props;
        
        const {services} = args;
        const {createCustomEl} = services;
        createCustomEl.addEventListener(acb, async e => {
            const acbE = (e as CustomEvent).detail as IAttrChgCB;
            const {instance, name, newVal, oldVal} = acbE;
            const {doAttr} = await import('./doAttr.js');
            await doAttr(acbE, props);
        })
        this.resolved = true;
        
    }

    setType(prop: PropInfo, val: any){
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
}

export interface CreatePropInfos extends ICreatePropInfos{}


const defaultProp: PropInfo = {
    type: 'Object',
    dry: true,
    parse: true,
};