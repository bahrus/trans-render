import { camelToLisp } from '../camelToLisp.js';
export const NotifyMixin = (superclass) => class extends superclass {
    onPropChange(self, propChange, moment) {
        if (super.onPropChange)
            super.onPropChange(self, propChange, moment);
        if (moment !== '+a' || !propChange.prop.notify)
            return;
        self.dispatchEvent(new CustomEvent(camelToLisp(propChange.key), {
            detail: {
                oldValue: propChange.ov,
                value: propChange.nv,
            }
        }));
        return true;
    }
};
