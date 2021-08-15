import { def } from './def.js';
import { DefineArgs, HasUpon, PropInfo, HasPropChangeQueue, Action, PropInfoTypes } from './types.d.js';
import { propUp } from './propUp.js';
import { camelToLisp } from './camelToLisp.js';
import { lispToCamel } from './lispToCamel.js';
export { camelToLisp } from './camelToLisp.js';
export { Action, PropInfo } from './types.d.js';


export function define<T = any>(args: DefineArgs<T>): {new(): T}{
    const c = args.config;
    const propInfos  = createPropInfos(args);
    let ext = HTMLElement;
    const mixins = args.mixins;
    if(mixins !== undefined){
        for(const mix of mixins){
            if(typeof mix === 'function'){
                ext = mix(ext);
            }
            
        }
    }
    
    class newClass extends ext{

        static is = c.tagName;
        static observedAttributes = getAttributeNames(propInfos);
        attributeChangedCallback(n: string, ov: string, nv: string){
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
            //TODO merge attributes?
            this.attachQR();
            const defaults: any = {...args.config.propDefaults, ...args.complexPropDefaults};
            for(const key in defaults){
                (<any>this)[key] = defaults[key];
            }
            propUp(this, Object.keys(propInfos), defaults);
            this.detachQR();
            if(c.initMethod !== undefined){
                (<any>this)[c.initMethod](this);
            }
            
        }

        attachQR(){
            this.QR = QR;
        }
        detachQR(){
            delete this.QR;
            const propChangeQueue = this.propChangeQueue;
            const actions = c.actions;
            const actionsToDo = new Set<string>();
            if(propChangeQueue !== undefined && actions !== undefined){
                for(const action of actions){
                    const {upon} = action;
                    const doAct = action.do as any;
                    if(upon === undefined) continue;
                    if(!checkRifs(action, this)) continue;
                    switch(typeof upon){
                        case 'string':
                            if(propChangeQueue.has(upon)){
                                actionsToDo.add(doAct);
                            }
                            break;
                        case 'object':
                            for(const dependency of upon){
                                if(propChangeQueue.has(dependency)){
                                    actionsToDo.add(doAct);
                                    break;
                                }
                            }
                            break;
                    }
                }
            }
            const values = Array.from(actionsToDo);
            for(const action of values){
                (<any>this)[action](this);
            }
            delete this.propChangeQueue;
        }
    }
    if(mixins !== undefined){
        const proto = newClass.prototype;
        for(const mix of mixins){
            if(typeof mix === 'object'){
                Object.assign(proto, mix);
            }
            
        }
    }
    interface newClass extends HasPropChangeQueue{}
    addPropsToClass(newClass, propInfos, args);
    def(newClass);
    return newClass as any as {new(): T};
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
    const actions = args.config.actions;
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
                this[privateKey] = nv;
                if(this.QR){
                    this.QR(key, this);
                    return;
                }
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
                    for(const action of filteredActions){
                        const fn = this[action.do];
                        if(fn === undefined) throw (action.do.toString() + " undefined");
                        this[action.do](this, key, ov, nv);
                    }
                }
            },
            enumerable: true,
            configurable: true,
        });
    }
}

function checkRifs(action: Action<any>, self: any){
    const {riff, rift} = action;
    if(riff !== undefined){
        for(const key of riff){
            if(!self[key]) return false;
        }
    }
    if(rift !== undefined){
        for(const key of rift){
            if(self[key]) return false;
        }
    }
    return true;
}


const QR = (propName: string, self: HasPropChangeQueue) => {
    if(self.propChangeQueue === undefined) self.propChangeQueue = new Set<string>();
    self.propChangeQueue.add(propName);
}



