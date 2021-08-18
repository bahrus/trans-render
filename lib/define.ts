import { def } from './def.js';
import { DefineArgs, HasUpon, PropInfo, HasPropChangeQueue, Action, PropInfoTypes, PropChangeInfo, PropChangeMoment } from './types.d.js';
import { propUp } from './propUp.js';
import { camelToLisp } from './camelToLisp.js';
import { lispToCamel } from './lispToCamel.js';
export { camelToLisp } from './camelToLisp.js';
export { Action, PropInfo } from './types.d.js';


export function define<T = any, P = PropInfo>(args: DefineArgs<T, P>): {new(): T}{
    const c = args.config;
    const propInfos  = createPropInfos(args);
    let ext = args.superclass || HTMLElement;
    const proto = ext.prototype;
    const mixins = args.mixins;
    if(mixins !== undefined){
        for(const mix of mixins){
            if(typeof mix === 'function'){
                ext = mix(ext);
            }else{
                Object.assign(proto, mix);
            }
            
        }
    }
    
    class newClass extends ext{

        static is = c.tagName;
        static observedAttributes = getAttributeNames(propInfos);
        constructor(){
            super();
            this.attachQR();
        }
        attributeChangedCallback(n: string, ov: string, nv: string){
            if(super.attributeChangedCallback) super.attributeChangedCallback(n, ov, nv);
            const propName = lispToCamel(n);
            const prop = propInfos[propName];
            if(prop !== undefined){
                if(prop.dry && ov === nv) return;
                const aThis = this as any;
                switch(prop.type){
                    case 'String':
                        aThis[propName] = nv;
                        break;
                    case 'Object':
                        if(prop.parse){
                            aThis[propName] = JSON.parse(nv);
                        }
                        break;
                    case 'Number':
                        aThis[propName] = Number(nv);
                        break;
                    case 'Boolean':
                        aThis[propName] = nv !== null;
                        break;
                }
            }
        }
        connectedCallback(){
            if(super.connectedCallback) super.connectedCallback();
            Object.assign(this.style, c.style);
            const defaults: any = {...args.config.propDefaults, ...args.complexPropDefaults};
            propUp(this as any as HTMLElement, Object.keys(propInfos), defaults);
            this.detachQR();
        }

        attachQR(){
            this.QR = QR;
        }
        detachQR(){
            delete this.QR;
            const propChangeQueue = this.propChangeQueue;
            const actions = c.actions;
            const actionsToDo = new Set<Action>();
            if(propChangeQueue !== undefined && actions !== undefined){
                for(const action of actions){
                    const {upon} = action;
                    const doAct = action.do as any;
                    if(upon === undefined) continue;
                    if(!checkRifs(action, this)) continue;
                    switch(typeof upon){
                        case 'string':
                            if(propChangeQueue.has(upon)){
                                actionsToDo.add(action);
                            }
                            break;
                        case 'object':
                            for(const dependency of upon){
                                if(propChangeQueue.has(dependency)){
                                    actionsToDo.add(action);
                                    break;
                                }
                            }
                            break;
                    }
                }
            }
            const values = Array.from(actionsToDo);
            doActions(values, this, propChangeQueue);
            delete this.propChangeQueue;
        }
        //TODO:  turn this into a mixin
        // subscribers: {propsOfInterest: Set<string>, callBack: (rs: newClass) => void}[] = [];
        // subscribe(propsOfInterest: Set<string>, callBack: (rs: newClass) => void){
        //     this.subscribers.push({propsOfInterest, callBack});
        // }
    
        // unsubscribe(propsOfInterest: Set<string>, callBack: (rs: newClass) => void){
        //     const idx = this.subscribers.findIndex(s => s.propsOfInterest === propsOfInterest && s.callBack === callBack);
        //     if(idx > -1) this.subscribers.splice(idx, 1);
        // }
    }
    // if(mixins !== undefined){
    //     const proto = newClass.prototype;
    //     for(const mix of mixins){
    //         if(typeof mix === 'object'){
    //             Object.assign(proto, mix);
    //         }
            
    //     }
    // }
    interface newClass extends HasPropChangeQueue{}
    addPropsToClass(newClass as any as {new(): HTMLElement}, propInfos, args);
    def(newClass);
    return newClass as any as {new(): T};
}
function doActions(actions: Action[], self: any, arg: any){
    for(const action of actions){
        const ret = (<any>self)[action.do](self, arg);
        if(action.merge) Object.assign(self, ret);
    }
}


function getAttributeNames(props: {[key: string]: PropInfo}){
    const returnArr: string[] = [];
    for(const key in props){
        const prop = props[key];
        if(prop.parse){
            returnArr.push(camelToLisp(key));
        }
    }
    return returnArr;
}

const defaultProp: PropInfo = {
    type: 'Object',
    dry: true,
    parse: true,
};

function setType(prop: PropInfo, val: any){
    if(val !== undefined){
        let t: string = typeof(val);
        t = t[0].toUpperCase() + t.substr(1);
        prop.type = t as PropInfoTypes;
    }
}

function createPropInfos(args: DefineArgs){
    const props: {[key: string]: PropInfo} = {};
    const defaults = {...args.complexPropDefaults, ...args.config.propDefaults};
    for(const key in defaults){
        const prop: PropInfo = {...defaultProp};
        setType(prop, defaults[key]);
        props[key] = prop;
    }
    const specialProps = args.config.propInfo;
    if(specialProps !== undefined){
        for(const key in specialProps){
            if(props[key] === undefined){
                const prop: PropInfo = {...defaultProp};
                props[key] = prop;
            }
            const prop = props[key];
            Object.assign(prop, specialProps[key]);
        }
    }
    const actions = args.config.actions;
    if(actions !== undefined){
        for(const action of actions){
            const upon = action.upon;
            if(upon === undefined) continue;
            for(const dependency of upon){
                if(props[dependency] === undefined){
                    const prop: PropInfo = {...defaultProp};
                    props[dependency] = prop;
                }
            }
        }
    }
    return props;
}


function addPropsToClass<T extends HTMLElement = HTMLElement>(newClass: {new(): T}, props: {[key: string]: PropInfo}, args: DefineArgs){
    const proto = newClass.prototype;
    const config = args.config;
    const actions = config.actions;
    for(const key in props){
        const prop = props[key];
        const privateKey = '_' + key;
        Object.defineProperty(proto, key, {
            get(){
                return this[privateKey];
            },
            set(nv){
                const ov = this[privateKey];
                if(prop.dry && this[privateKey] === nv) return;
                const propChangeMethod = config.propChangeMethod;
                const thisPropChangeMethod = (propChangeMethod !== undefined ? this[propChangeMethod] : undefined)  as undefined | ((self: EventTarget, pci: PropChangeInfo, moment: PropChangeMoment) => boolean);
                const methodIsDefined = thisPropChangeMethod !== undefined;
                const arg: PropChangeInfo = {key, ov, nv, prop};
                if(methodIsDefined) if(thisPropChangeMethod!(this, arg, 'v') === false) return; //v = validate
                this[privateKey] = nv;
                //TODO:  turn this into mixin
                // for(const subscriber of this.subscribers){
                //     if(subscriber.propsOfInterest.has(key)){
                //         subscriber.callback(this);
                //     }
                // }
                if(this.QR){
                    this.QR(key, this);
                    if(methodIsDefined) thisPropChangeMethod!(this, arg, '+qr');
                    return;
                }
                if(methodIsDefined) if(thisPropChangeMethod!(this, arg, '-a') === false) return; //-a = pre actions
                if(actions !== undefined){
                    const filteredActions = actions.filter(x => {
                        if(!checkRifs(x, this)) return false;
                        const upon = x.upon;
                        switch(typeof upon){
                            case 'string':
                                return upon === key;
                            case 'object':
                                return upon.includes(key);
                        }

                    });
                    doActions(filteredActions, this, {key, ov, nv});
                }
                if(methodIsDefined) thisPropChangeMethod!(this, arg, '+a'); //+a = post actions
            },
            enumerable: true,
            configurable: true,
        });
    }
}

function checkRifs(action: Action<any>, self: any){
    const {riff, upon} = action;
    if(riff !== undefined){
        const realRiff = (riff === '"' || riff === "'") ? upon! : riff;
        for(const key of realRiff){
            if(!self[key]) return false;
        }
    }
    return true;
}


const QR = (propName: string, self: HasPropChangeQueue) => {
    if(self.propChangeQueue === undefined) self.propChangeQueue = new Set<string>();
    self.propChangeQueue.add(propName);
}



