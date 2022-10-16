type Constructor<T = {}> = new (...args: any[]) => T;

declare global{
    interface HTMLElement{
        disconnectedCallback() : any;
    }
}

const eventNames = ["animationstart", "MSAnimationStart", "webkitAnimationStart"];
const boundListeners = new WeakMap<Element, any>();

export function addCSSListener(id: string, self: any, targetSelector: string, insertListener: any, customStyles: string = '', addToSelf = false){
        // See https://davidwalsh.name/detect-node-insertion
        if(!boundListeners.has(self as Element)){
            boundListeners.set(self, {});
        }
        const boundInsertListeners = boundListeners.get(self as Element);
        if(boundInsertListeners[targetSelector] !== undefined) return;
        const styleInner = /* css */`
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
        if(!(<any>host).host){
            host = document.head;
            hostIsShadow = false;
        }
        const container = hostIsShadow ? host : document;
        eventNames.forEach(name =>{
            container.addEventListener(name, boundInsertListeners[targetSelector], false);
        })
        if(addToSelf){
            self.appendChild(style);
        }else{
            host.appendChild(style);
        }
}


export function observeCssSelector<TBase extends Constructor<HTMLElement>>(superClass: TBase) {

    return class extends superClass {

        _boundInsertListener!: any;
        _host: any;
        addCSSListener(id: string, targetSelector: string, insertListener: any, customStyles: string = ''){
           addCSSListener(id, this, targetSelector, insertListener, customStyles);
        }
        disconnect(){
            if(this._boundInsertListener){
                const hostIsShadow = this._host.localName !== 'html';
                const container = hostIsShadow ? this._host : document;
                eventNames.forEach(name =>{
                    container.removeEventListener(name, this._boundInsertListener);
                })
            }
        }
        disconnectedCallback(){
            this.disconnect();
            if(super.disconnectedCallback !== undefined) super.disconnectedCallback();
        }
    }
}