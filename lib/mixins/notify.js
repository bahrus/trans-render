import { camelToLisp } from '../camelToLisp.js';
export const NotifyMixin = (superclass) => class extends superclass {
    onPropChange(self, propChange, moment) {
        if (super.onPropChange)
            super.onPropChange(self, propChange, moment);
        const aSelf = self;
        const notify = propChange.prop.notify;
        if (notify === undefined || (moment !== '+a' && moment != '+qr'))
            return;
        const { dispatch, echoTo, toggleTo, echoDelay, toggleDelay, reflect } = notify;
        const lispName = camelToLisp(propChange.key);
        if (dispatch) {
            self.dispatchEvent(new CustomEvent(lispName + '-changed', {
                detail: {
                    oldValue: propChange.ov,
                    value: propChange.nv,
                }
            }));
        }
        if (echoTo !== undefined) {
            if (echoDelay) {
                const echoDelayNum = typeof (echoDelay) === 'number' ? echoDelay : self[echoDelay];
                setTimeout(() => {
                    aSelf[echoTo] = propChange.nv;
                }, echoDelayNum);
            }
            else {
                aSelf[echoTo] = propChange.nv;
            }
        }
        if (toggleTo !== undefined) {
            if (toggleDelay) {
                const toggleDelayNum = typeof (toggleDelay) === 'number' ? toggleDelay : self[toggleDelay];
                setTimeout(() => {
                    aSelf[toggleTo] = !propChange.nv;
                }, toggleDelayNum);
            }
            else {
                aSelf[toggleTo] = !propChange.nv;
            }
            aSelf[toggleTo] = !propChange.nv;
        }
        if (reflect !== undefined) {
            if (reflect.asAttr) {
                aSelf.inReflectMode = true;
                let val = propChange.nv;
                let remAttr = false;
                switch (propChange.prop.type) {
                    case 'Number':
                        val = val.toString();
                        break;
                    case 'Boolean':
                        if (val) {
                            val = '';
                        }
                        else {
                            remAttr = true;
                        }
                        break;
                    case 'Object':
                        val = JSON.stringify(val);
                        break;
                }
                if (remAttr) {
                    aSelf.removeAttribute(lispName);
                }
                else {
                    aSelf.setAttribute(lispName, val);
                }
                aSelf.inReflectMode = false;
            }
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
