import { camelToLisp } from '../camelToLisp.js';
export const NotifyMixin = (superclass) => class extends superclass {
    onPropChange(self, propChange, moment) {
        if (super.onPropChange)
            super.onPropChange(self, propChange, moment);
        const notify = propChange.prop.notify;
        if (notify === undefined || (moment !== '+a' && moment != '+qr'))
            return;
        const { dispatch, echoTo, toggleTo, echoDelay } = notify;
        if (dispatch) {
            self.dispatchEvent(new CustomEvent(camelToLisp(propChange.key) + '-changed', {
                detail: {
                    oldValue: propChange.ov,
                    value: propChange.nv,
                }
            }));
        }
        if (echoTo !== undefined) {
            if (echoDelay) {
                let echoDelayNum = typeof (echoDelay) === 'number' ? echoDelay : self[echoDelay];
                setTimeout(() => {
                    self[echoTo] = propChange.nv;
                }, echoDelayNum);
            }
            else {
                self[echoTo] = propChange.nv;
            }
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
            dispatch: true,
        }
    }
};
