import { DefineArgs, LogicOp, lop, LogicOpProp, PropInfo, HasPropChangeQueue, Action, PropInfoTypes, PropChangeInfo, PropChangeMoment, ListOfLogicalExpressions } from './types.js';
export { Action, PropInfo} from './types.js';

export class CE<T = any, P = PropInfo>{
    defaultProp: PropInfo = {
        type: 'Object',
        dry: true,
        parse: true,
    };

    def(args: DefineArgs<T, P>): {new(): T}{
        const {getAttributeNames, doActions, fine, pq, toCamel, toLisp, propUp} = this;
        const self = this;
        const {config} = args;
        const {tagName, style, actions} = config;
        const propInfos  = this.createPropInfos(args);
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

            static is = tagName;
            static observedAttributes = getAttributeNames(propInfos, toLisp);
            constructor(){
                super();
                this.attachQR();
            }
            attributeChangedCallback(n: string, ov: string, nv: string){
                if(super.attributeChangedCallback) super.attributeChangedCallback(n, ov, nv);
                const propName = toCamel(n);
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
                Object.assign(this.style, style);
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
                const acts = actions;
                //const actionsToDo = new Set<Action>();
                const actionsToDo: any = {};
                if(propChangeQueue !== undefined && acts !== undefined){
                    for(const doAct in acts){
                        const action = acts[doAct] as Action;
                        if(!pq(action, self, this, 'and')) continue;
                        actionsToDo[doAct] = action;
                    }
                }
                doActions(actionsToDo, this, propChangeQueue);
                delete this.propChangeQueue;
            }

        }

        this.addPropsToClass(newClass as any as {new(): HTMLElement}, propInfos, args);
        fine(tagName, newClass as any as ({new(): HTMLElement}));
        return newClass as any as {new(): T};
    }

    fine(tagName: string, newClass: {new(): HTMLElement}){
        customElements.define(tagName, newClass);
    }

    async doActions(actions: {[methodName: string]: Action}, self: any, arg: any){
        for(const methodName in actions){
            const fn = (<any>self)[methodName].bind(self);
            const action = actions[methodName];
            const ret = action.async ? await fn(self, arg) : fn(self, arg);
            if(action.merge) Object.assign(self, ret);
        }
    }

    getAttributeNames(props: {[key: string]: PropInfo}, toLisp: (s: string) => string){
        const returnArr: string[] = [];
        for(const key in props){
            const prop = props[key];
            if(prop.parse){
                returnArr.push(toLisp((key)));
            }
        }
        return returnArr;
    }

    /**
     * Needed for asynchronous loading
     * @param props Array of property names to "upgrade", without losing value set while element was Unknown
     * @param defaultValues:   If property value not set, set it from the defaultValues lookup
     * @private
     */
    propUp<T>(self: HTMLElement, props: string[], defaultValues?: T){
        for(const prop of props){
            let value = (<any>self)[prop];
            if(value === undefined && defaultValues !== undefined){
                value = (<any>defaultValues)[prop];
            }
            if (self.hasOwnProperty(prop)) {
                delete (<any>self)[prop];
            }
            //some properties are read only.
            try{(<any>self)[prop] = value;}catch{}
        }
    }

    setType(prop: PropInfo, val: any){
        if(val !== undefined){
            let t: string = typeof(val);
            t = t[0].toUpperCase() + t.substr(1);
            prop.type = t as PropInfoTypes;
        }
    }

    createPropInfos(args: DefineArgs){
        const {defaultProp, setType} = this;
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
            for(const methodName in actions){
                const action = actions[methodName] as Action;
                const upon = action.ifAnyOf as string[];
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

    addPropsToClass<T extends HTMLElement = HTMLElement>(newClass: {new(): T}, props: {[key: string]: PropInfo}, args: DefineArgs){
        const {doActions, pq} = this;
        const self = this;
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

                    if(this.QR){
                        this.QR(key, this);
                        if(methodIsDefined) thisPropChangeMethod!(this, arg, '+qr');
                        return;
                    }
                    if(methodIsDefined) if(thisPropChangeMethod!(this, arg, '-a') === false) return; //-a = pre actions
                    if(actions !== undefined){
                        const filteredActions: any = {};
                        for(const methodName in actions){
                            const action = actions[methodName]!;
                            if(self.pq(action, self, this, 'and')){
                                const upon = action.ifAnyOf as string[];
                                if(upon.includes(key)){
                                    filteredActions[methodName] = action;
                                }
                            }
                        }

                        doActions(filteredActions, this, {key, ov, nv});
                    }
                    if(methodIsDefined) thisPropChangeMethod!(this, arg, '+a'); //+a = post actions
                },
                enumerable: true,
                configurable: true,
            });
        }
    }

    pq(expr: LogicOp<any>, self: this, src: any, op: lop): boolean{
        let answer = op === 'and' ? true : false;
        for(const logicalOp in expr){
            const rhs: any = (<any>expr)[logicalOp];
            if(!Array.isArray(rhs)) throw 'NI'; //not implemented
            let arrayLogicalOp: lop = 'and';
            if(logicalOp.endsWith('AnyOf')) arrayLogicalOp = 'or';
            const subAnswer = self.pqs(rhs, self, src, arrayLogicalOp);
            switch(op){
                case 'and':
                    if(!subAnswer) return false;
                    break;
                case 'or':
                    if(subAnswer) return true;
                    break;
            }
        }
        // const {riff, upon} = action;
        // if(riff !== undefined){
        //     const realRiff = (riff === '"' || riff === "'") ? upon! : riff;
        //     for(const key of realRiff){
        //         if(!self[key]) return false;
        //     }
        // }
        
        return answer;
    }

    pqs(expr: ListOfLogicalExpressions, self: this, src: any, op: lop): boolean{
        let answer = op === 'and' ? true : false;
        for(const subExpr of expr){
            let subAnswer = false;
            switch(typeof subExpr){
                case 'string':
                    subAnswer = !!src[subExpr];
                    break;
                case 'object':
                    subAnswer = self.pq(subExpr, self, src, 'and');
                    break;
                default:
                    throw 'NI'; //Not Implemented
             }
             switch(op){
                case 'and':
                    if(!subAnswer) return false;
                    break;
                case 'or':
                    if(subAnswer) return true;
                    break;
            }
        }
        return answer;
    }



    toLisp(s: string){return s.split(ctlRe).join('-').toLowerCase();}
    toCamel(s: string){return s.replace(stcRe, function(m){return m[1].toUpperCase();});}
}

const QR = (propName: string, self: HasPropChangeQueue) => {
    if(self.propChangeQueue === undefined) self.propChangeQueue = new Set<string>();
    self.propChangeQueue.add(propName);
}


const ctlRe = /(?=[A-Z])/;
const stcRe = /(\-\w)/g;



