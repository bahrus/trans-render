import {camelToLisp} from '../camelToLisp.js';
import {PropChangeInfo, PropChangeMoment} from '../types.d.js';
export const NotifyMixin = (superclass: {new(): any}) => class extends superclass{
    onPropChange(self: EventTarget, propChange: PropChangeInfo, moment: PropChangeMoment){
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
