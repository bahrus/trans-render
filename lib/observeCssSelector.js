const eventNames = ["animationstart", "MSAnimationStart", "webkitAnimationStart"];
const boundListeners = new WeakMap();
export function addCSSListener(id, self, targetSelector, insertListener, customStyles = '', addToSelf = false) {
    // See https://davidwalsh.name/detect-node-insertion
    if (!boundListeners.has(self)) {
        boundListeners.set(self, {});
    }
    const boundInsertListeners = boundListeners.get(self);
    if (boundInsertListeners[targetSelector] !== undefined)
        return;
    const styleInner = /* css */ `
        @keyframes ${id} {
            from {
                opacity: 0.99;
            }
            to {
                opacity: 1;
            }
        }

        ${targetSelector}{
            animation-duration: 0.001s;
            animation-name: ${id};
        }

        ${customStyles}`;
    const style = document.createElement('style');
    style.innerHTML = styleInner;
    boundInsertListeners[targetSelector] = insertListener.bind(self);
    let host = self.getRootNode();
    let hostIsShadow = true;
    if (!host.host) {
        host = document.head;
        hostIsShadow = false;
    }
    const container = hostIsShadow ? host : document;
    eventNames.forEach(name => {
        container.addEventListener(name, boundInsertListeners[targetSelector], false);
    });
    if (addToSelf) {
        self.appendChild(style);
    }
    else {
        host.appendChild(style);
    }
}
export function observeCssSelector(superClass) {
    return class extends superClass {
        _boundInsertListener;
        _host;
        addCSSListener(id, targetSelector, insertListener, customStyles = '') {
            addCSSListener(id, this, targetSelector, insertListener, customStyles);
        }
        disconnect() {
            if (this._boundInsertListener) {
                const hostIsShadow = this._host.localName !== 'html';
                const container = hostIsShadow ? this._host : document;
                eventNames.forEach(name => {
                    container.removeEventListener(name, this._boundInsertListener);
                });
            }
        }
        disconnectedCallback() {
            this.disconnect();
            if (super.disconnectedCallback !== undefined)
                super.disconnectedCallback();
        }
    };
}
