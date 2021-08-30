import {camelToLisp} from '../camelToLisp.js';
import {PropChangeInfo, PropChangeMoment, PropInfo} from '../types.d.js';
export const NotifyMixin = (superclass: {new(): any}) => class extends superclass{
    onPropChange(self: EventTarget, propChange: PropChangeInfo<INotifyPropInfo>, moment: PropChangeMoment){
        if(super.onPropChange) super.onPropChange(self, propChange, moment);
        const notify = propChange.prop.notify;
        if(notify === undefined || (moment !== '+a' && moment != '+qr')) return;
        const {dispatch, echoTo, toggleTo, echoDelay, reflect} = notify;
        const lispName = camelToLisp(propChange.key);
        if(dispatch){
            self.dispatchEvent(new CustomEvent(lispName + '-changed', {
                detail:{
                    oldValue: propChange.ov,
                    value: propChange.nv,
                }
            }));
        }
        if(echoTo !== undefined){
            if(echoDelay){
                let echoDelayNum: number = typeof(echoDelay) === 'number' ? echoDelay : (<any>self)[echoDelay];
                setTimeout(() => {
                    (<any>self)[echoTo] = propChange.nv;
                }, echoDelayNum);
            }else{
                (<any>self)[echoTo] = propChange.nv;
            }
            
        }
        if(toggleTo !== undefined){
            (<any>self)[toggleTo] = !propChange.nv;
        }
        if(reflect !== undefined){
            if(reflect.asAttr){
                this.inReflectMode = true;
                let val = propChange.nv;
                let remAttr = false;
                switch(propChange.prop.type){
                    case 'Number':
                        val = val.toString();
                        break;
                    case 'Boolean':
                        if(val){
                            val = '';
                        }else{
                            remAttr = true;
                        }
                        break;
                    case 'Object':
                        val = JSON.stringify(val);
                        break;
                }
                if(remAttr){
                    this.removeAttribute(lispName);
                }else{
                    this.setAttribute(lispName, val);
                }
                this.inReflectMode = false;
            }
        }
        return true;
    }
};

export interface CommonProps {
    disabled?: boolean,
    enabled?: boolean,
    value?: any,
}

export const commonPropsInfo: Partial<{[key in keyof CommonProps]: INotifyPropInfo<CommonProps>}> = {
    disabled: {
        notify:{
            toggleTo: 'enabled'
        }
    },
    value:{
        notify:{
            dispatch: true,
        }
    }
};


export interface INotifyMixin{
    onPropChange(self: this, propChange: PropChangeInfo, moment: PropChangeMoment): boolean;
}

export interface INotifyPropInfo<TMixinComposite = any> extends PropInfo{ //yikes!  How many combinations will we need to support for this?
    notify?: {
        dispatch?: boolean,
        echoTo?: keyof TMixinComposite,
        echoDelay?: number | (keyof TMixinComposite),
        toggleTo?: keyof TMixinComposite,
        reflect?:{
            asAttr?:boolean;
        }
    }
}
