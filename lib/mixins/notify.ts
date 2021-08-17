import {camelToLisp} from '../camelToLisp.js';
import {PropChangeInfo, PropChangeMoment, PropInfo} from '../types.d.js';
export const NotifyMixin = (superclass: {new(): any}) => class extends superclass{
    onPropChange(self: EventTarget, propChange: PropChangeInfo<INotifyPropInfo>, moment: PropChangeMoment){
        if(super.onPropChange) super.onPropChange(self, propChange, moment);
        if((moment !== '+a' && moment != '+qr') || !propChange.prop.notify) return;
        self.dispatchEvent(new CustomEvent(camelToLisp(propChange.key), {
            detail:{
                oldValue: propChange.ov,
                value: propChange.nv,
            }
        }));
        return true;
    }
};
export interface INotifyMixin{
    onPropChange(self: EventTarget, propChange: PropChangeInfo, moment: PropChangeMoment): boolean;
}
export interface INotifyPropInfo extends PropInfo{ //yikes!  How many combinations will we need to support for this?
    notify?: boolean;
}
