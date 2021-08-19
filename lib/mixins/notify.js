import { camelToLisp } from '../camelToLisp.js';
export const NotifyMixin = (superclass) => class extends superclass {
    onPropChange(self, propChange, moment) {
        if (super.onPropChange)
            super.onPropChange(self, propChange, moment);
        const notify = propChange.prop.notify;
        if (notify === undefined || (moment !== '+a' && moment != '+qr'))
            return;
        const { viaCustEvt, echoTo, toggleTo } = notify;
        if (viaCustEvt === true) {
            self.dispatchEvent(new CustomEvent(camelToLisp(propChange.key) + '-changed', {
                detail: {
                    oldValue: propChange.ov,
                    value: propChange.nv,
                }
            }));
        }
        if (echoTo !== undefined) {
            self[echoTo] = propChange.nv;
        }
        if (toggleTo !== undefined) {
            self[toggleTo] = !propChange.nv;
        }
        return true;
    }
};
export const commonPropsInfo = {
    disabled: {
        notify: {
            toggleTo: 'enabled'
        }
    },
    value: {
        notify: {
            viaCustEvt: true,
        }
    }
};
