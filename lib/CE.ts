import { DefineArgs, LogicOp, lop, LogicOpProp, PropInfo, HasPropChangeQueue, Action, PropInfoTypes, PropChangeInfo, PropChangeMoment, ListOfLogicalExpressions, TRElementMixin } from './types.js';
export { Action, PropInfo} from './types.js';

export class CE<MCProps = any, MCActions = MCProps, TPropInfo = PropInfo, TAction extends Action<MCProps> = Action<MCProps>>{
    defaultProp: PropInfo = {
        type: 'Object',
        dry: true,
        parse: true,
    };

    addProps<T extends HTMLElement = HTMLElement>(newClass: {new(): T}, props: {[key: string]: PropInfo}, args: DefineArgs){
        const {doActions, pq, getProps} = this;
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
                            const props = getProps(action);
                            if(!props.has(key)) continue;
                            if(pq(self, action, this, 'and', key)){
                                filteredActions[methodName] = action;
                            }
                        }
                        doActions(self, filteredActions, this, {key, ov, nv});
                    }
                    if(methodIsDefined) thisPropChangeMethod!(this, arg, '+a'); //+a = post actions
                },
                enumerable: true,
                configurable: true,
            });
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
                const upon = this.getProps(action);
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

    def(args: DefineArgs<MCProps, MCActions, TPropInfo>): {new(): MCProps & MCActions}{
        const {getAttrNames: getAttributeNames, doActions, fine, pq, toCamel, toLisp, propUp, getProps} = this;
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
                                let val = nv;
                                try{
                                    val = JSON.parse(nv);
                                }catch(e){}
                                aThis[propName] = val;
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
                const propChangeQueue = this.propChangeQueue as Set<string> | undefined;
                const acts = actions;
                //const actionsToDo = new Set<Action>();
                const actionsToDo: any = {};
                if(propChangeQueue !== undefined && acts !== undefined){
                    for(const doAct in acts){
                        const action = acts[doAct] as Action;
                        const props = getProps(action);
                        let actionIsApplicable = false;
                        for(const prop of props){
                            if(propChangeQueue.has(prop)){
                                actionIsApplicable = pq(self, action, this, 'and', prop);
                                if(actionIsApplicable){
                                    break;
                                }
                            }
                        }
                        if(!actionIsApplicable) continue;
                        actionsToDo[doAct] = action;
                    }
                }
                doActions(self, actionsToDo, this, propChangeQueue);
                delete this.propChangeQueue;
            }

        }

        interface newClass extends TRElementMixin{};

        this.addProps(newClass as any as {new(): HTMLElement}, propInfos, args);
        fine(tagName, newClass as any as ({new(): HTMLElement}));
        return newClass as any as {new(): MCProps & MCActions};
    }

    async doActions(self: this, actions: {[methodName: string]: Action}, target: any, arg: any){
        for(const methodName in actions){
            const fn = (<any>target)[methodName].bind(target);
            const action = actions[methodName];
            const ret = action.async ? await fn(target, arg) : fn(target, arg);
            self.postHoc(self, action, target, ret);
        }
    }

    fine(tagName: string, newClass: {new(): HTMLElement}){
        customElements.define(tagName, newClass);
    }

    getAttrNames(props: {[key: string]: PropInfo}, toLisp: (s: string) => string){
        const returnArr: string[] = [];
        for(const key in props){
            const prop = props[key];
            if(prop.parse){
                returnArr.push(toLisp((key)));
            }
        }
        return returnArr;
    }

    getProps(action: Action): Set<string>{
        return new Set<string>([...(action.ifAllOf || []) as string[], ...(action.actIfKeyIn || []), ...(action.andAlsoActIfKeyIn || []) as string[]]);
    }

    postHoc(self: this, action: Action, target: any, returnVal: any){
        Object.assign(target, returnVal);
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






    pq(self: this, expr: LogicOp<any>, src: any, op: lop, key: string): boolean{
        // let answer = op === 'and' ? true : false;
        // for(const logicalOp in expr){
        //     const rhs: any = (<any>expr)[logicalOp];
        //     let arrayLogicalOp: lop;
        //     if(logicalOp.endsWith('AnyOf')) {
        //         arrayLogicalOp = 'or';
        //     }else if(logicalOp.endsWith('AllOf')){
        //         arrayLogicalOp = 'and';
        //     }else{
        //         continue;
        //     }
        //     if(!Array.isArray(rhs)) throw 'NI'; //Not Implemented
        //     const subAnswer = self.pqs(rhs, self, src, arrayLogicalOp);
        //     switch(op){
        //         case 'and':
        //             if(!subAnswer) return false;
        //             break;
        //         case 'or':
        //             if(subAnswer) return true;
        //             break;
        //     }
        // }
        const {ifAllOf} = expr;
        const {pqs} = self;
        if(ifAllOf !== undefined){
            if(!pqs(self, ifAllOf as ListOfLogicalExpressions, src, 'and')) return false;
        }
        return true;
    }
    
    pqsv(self: this, src: any, subExpr: string | number | symbol | LogicOp<any>): boolean{
        return !!src[subExpr as any as string];
    }
    pqs(self: this, expr: ListOfLogicalExpressions,  src: any, op: lop): boolean{
        let answer = op === 'and' ? true : false;
        for(const subExpr of expr){
            const subAnswer = self.pqsv(self, src, subExpr);
            //let subAnswer = false;
            // switch(typeof subExpr){
            //     case 'string':
            //         subAnswer = !!src[subExpr];
            //         break;
            //     case 'object':
            //         subAnswer = self.pq(subExpr, self, src, 'and');
            //         break;
            //     default:
            //         throw 'NI'; //Not Implemented
            //  }
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



