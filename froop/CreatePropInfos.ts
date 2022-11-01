import {PropInfo, DefineArgs, WCConfig, Action, PropInfoTypes} from '../lib/types';
import {DefineArgsWithServices, ICreatePropInfos} from './types';
import {r} from './const.js';
import { ResolvableService } from './ResolvableService.js';

export class CreatePropInfos extends ResolvableService implements ICreatePropInfos{
    constructor(public args: DefineArgsWithServices){
        super();
        this.do();

    }
    propInfos?: {[key: string]: PropInfo};
    async do(){
        const {args} = this;
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
}


const defaultProp: PropInfo = {
    type: 'Object',
    dry: true,
    parse: true,
};