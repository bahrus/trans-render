import {camelToLisp} from '../camelToLisp.js';
import {PropChangeInfo, PropChangeMoment, PropInfo} from '../types.d.js';
export const NotifyMixin = (superclass: {new(): any}) => class extends superclass{
    onPropChange(self: EventTarget, propChange: PropChangeInfo<INotifyPropInfo>, moment: PropChangeMoment){
        if(super.onPropChange) super.onPropChange(self, propChange, moment);
        const notify = propChange.prop.notify;
        if(notify === undefined || (moment !== '+a' && moment != '+qr')) return;
        const {viaCustEvt, echoTo, toggleTo} = notify;
        if(viaCustEvt === true){
            self.dispatchEvent(new CustomEvent(camelToLisp(propChange.key) + '-changed', {
                detail:{
                    oldValue: propChange.ov,
                    value: propChange.nv,
                }
            }));
        }
        if(echoTo !== undefined){
            (<any>self)[echoTo] = propChange.nv;
        }
        if(toggleTo !== undefined){
            (<any>self)[toggleTo] = !propChange.nv;
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
            viaCustEvt: true,
        }
    }
};


export interface INotifyMixin{
    onPropChange(self: EventTarget, propChange: PropChangeInfo, moment: PropChangeMoment): boolean;
}

export interface INotifyPropInfo<TMixinComposite = any> extends PropInfo{ //yikes!  How many combinations will we need to support for this?
    notify?: {
        viaCustEvt?: boolean,
        echoTo?: keyof TMixinComposite,
        toggleTo?: keyof TMixinComposite,
    }
}
