import { camelToLisp } from '../camelToLisp.js';
export const NotifyMixin = (superclass) => class extends superclass {
    onPropChange(self, propChange, moment) {
        if (super.onPropChange)
            super.onPropChange(self, propChange, moment);
        const notify = propChange.prop.notify;
        if (notify === undefined || (moment !== '+a' && moment != '+qr'))
            return;
        const { dispatch, echoTo, toggleTo, echoDelay, reflect } = notify;
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
        if (reflect !== undefined) {
            if (reflect.asAttr) {
                this.inReflectMode = true;
                let val = propChange.nv;
                switch (propChange.prop.type) {
                    case 'Number':
                        val = val.toString();
                        break;
                    case 'Boolean':
                        if (val) {
                            val = '';
                        }
                        else {
                            this.removeAttribute(lispName);
                            return true; //dangerous!!!!!!
                        }
                        break;
                    case 'Object':
                        val = JSON.stringify(val);
                        break;
                }
                this.setAttribute(camelToLisp(propChange.key), val);
                this.inReflectMode = false;
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
