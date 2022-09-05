import { Action, PropInfo, TRElementActions, TRElementProps, WCConfig, PropChangeInfo, DefineArgs, PropChangeMethod} from './types.js';
import {CE} from './CE.js';

export function addProps<T extends HTMLElement = HTMLElement, MCProps = any, MCActions = MCProps, TPropInfo = any>(ce: CE, newClass: {new(): T}, props: {[key: string]: PropInfo}, args: DefineArgs<MCProps, MCActions, TPropInfo>){
    const {doActions, pq, getProps, doPA, act2Props} = ce;
    const proto = newClass.prototype;
    const config = args.config as WCConfig;
    //const actions = this.mergedActions;
    for(const key in props){
        const prop = props[key];
        //const privateKey = '_' + key;
        if(key in proto) continue;
        Object.defineProperty(proto, key, {
            get(){
                //return this[privateKey];
                return this.getValues()[key];
            },
            set(nv){
                const vals = this.getValues();
                const ov = vals[key];
                if(prop.dry && ov === nv) return;
                const propChangeMethod = config.propChangeMethod;
                const pcm = (propChangeMethod !== undefined ? this[propChangeMethod] : undefined)  as undefined | PropChangeMethod;
                //const methodIsDefined = pcm !== undefined;
                const pci: PropChangeInfo = {key, ov, nv, prop, pcm};
                //if(!(doPA(ce, this, pci, 'v'))) return;
                vals[key] = nv;
                // if(this.isInQuietMode){
                //     doPA(ce, this, pci, '+qm');
                // }
                if(this.QR){
                    this.QR(key, this);
                    doPA(ce, this, pci, '+qr');
                    return;
                }else{
                    //if(!(doPA(ce, this, pci, '-a'))) return; //-a = pre actions
                }
                
                const actions = this.mergedActions;
                if(actions !== undefined){
                    const filteredActions: any = {};
                    for(const methodName in actions){
                        let action = actions[methodName]!;
                        if(typeof(action) === 'string'){
                            action = {ifAllOf:[action]};
                        }
                        let props = act2Props[methodName];
                        if(props === undefined){
                            props = getProps(ce, action);
                            act2Props[methodName] = props;
                        }
                        
                        if(!props.has(key)) continue;
                        if(pq(ce, action, this)){
                            filteredActions[methodName] = action;
                        }
                    }
                    (async () => {
                        await doActions(ce, filteredActions, this);
                        doPA(ce, this, pci, '+a'); //+a = post actions
                    })()
                    
                }else{
                    doPA(ce, this, pci, '+a'); //+a = post actions
                }
                
            },
            enumerable: true,
            configurable: true,
        });
    }
}