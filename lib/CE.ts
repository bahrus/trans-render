import { DefineArgs, LogicOp, LogicEvalContext, LogicOpProp, PropInfo, HasPropChangeQueue, Action, PropInfoTypes, PropChangeInfo, PropChangeMoment, ListOfLogicalExpressions, TRElementMixin, PropChangeMethod } from './types.js';
export { Action, PropInfo} from './types.js';

export class CE<MCProps = any, MCActions = MCProps, TPropInfo = PropInfo, TAction extends Action<MCProps> = Action<MCProps>>{

    constructor(public args?: DefineArgs<MCProps, MCActions, TPropInfo, TAction>){
        if(args !== undefined) this.def(args);
    }

    defaultProp: PropInfo = {
        type: 'Object',
        dry: true,
        parse: true,
    };

    addProps<T extends HTMLElement = HTMLElement>(newClass: {new(): T}, props: {[key: string]: PropInfo}, args: DefineArgs){
        const {doActions, pq, getProps, doPA} = this;
        const self = this;
        const proto = newClass.prototype;
        const config = args.config;
        const actions = config.actions;
        for(const key in props){
            const prop = props[key];
            const privateKey = '_' + key;
            if(key in proto) continue;
            Object.defineProperty(proto, key, {
                get(){
                    return this[privateKey];
                },
                set(nv){
                    const ov = this[privateKey];
                    if(prop.dry && this[privateKey] === nv) return;
                    const propChangeMethod = config.propChangeMethod;
                    const pcm = (propChangeMethod !== undefined ? this[propChangeMethod] : undefined)  as undefined | PropChangeMethod;
                    //const methodIsDefined = pcm !== undefined;
                    const pci: PropChangeInfo = {key, ov, nv, prop, pcm};
                    if(!doPA(self, this, pci, 'v')) return;
                    this[privateKey] = nv;

                    if(this.QR){
                        this.QR(key, this);
                        doPA(self, this, pci, '+qr');
                        return;
                    }else{
                        if(!doPA(self, this, pci, '-a')) return; //-a = pre actions
                    }
                    

                    if(actions !== undefined){
                        const filteredActions: any = {};
                        for(const methodName in actions){
                            const action = actions[methodName]!;
                            const props = getProps(self, action); //TODO:  cache this
                            if(!props.has(key)) continue;
                            if(pq(self, action, this)){
                                filteredActions[methodName] = action;
                            }
                        }
                        doActions(self, filteredActions, this, {key, ov, nv});
                    }
                    doPA(self, this, pci, '+a'); //+a = post actions
                },
                enumerable: true,
                configurable: true,
            });
        }
    }

    doPA(self: this, src: any, pci: PropChangeInfo, m: PropChangeMoment): boolean{ //[TODO rename]
        if(pci.pcm !== undefined) return pci.pcm(src, pci, m) !== false;
        return true;
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
                const upon = this.getProps(this, action);
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

    classDef: {new(): MCProps & MCActions & TRElementMixin & HTMLElement} | undefined;

    def(args: DefineArgs<MCProps, MCActions, TPropInfo, TAction>): {new(): MCProps & MCActions}{
        this.args = args;
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
            static observedAttributes = getAttributeNames(propInfos, toLisp, ext);
            static reactiveProps = propInfos;
            constructor(){
                super();
                this.attachQR();
            }
            attributeChangedCallback(n: string, ov: string, nv: string){
                if(super.attributeChangedCallback) super.attributeChangedCallback(n, ov, nv);
                let propName = toCamel(n);
                const prop = propInfos[propName];
                if(this.inReflectMode) propName = '_' + propName;
                if(prop !== undefined){
                    if(prop.dry && ov === nv) return;
                    const aThis = this as any;
                    switch(prop.type){
                        case 'String':
                            aThis[propName] = nv;
                            break;
                        case 'Object':
                            if(prop.parse){
                                let val = nv.trim();
                                if(val!==null && ['[', '{'].includes(val[0])){
                                    try{
                                        val = JSON.parse(val);
                                    }catch(e){}
                                }
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
                        const props = getProps(self, action); //TODO:  Cache this
                        let actionIsApplicable = false;
                        for(const prop of props){
                            if(propChangeQueue.has(prop)){
                                actionIsApplicable = pq(self, action, this as any as MCProps);
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
        this.classDef = newClass as any as {new(): MCProps & MCActions & TRElementMixin & HTMLElement};
        return this.classDef;
    }

    async doActions(self: this, actions: {[methodName: string]: Action}, target: any, arg: any){
        for(const methodName in actions){
            const action = actions[methodName];
            if(action.debug) debugger;
            const ret = action.async ? await (<any>target)[methodName](target) : (<any>target)[methodName](target);
            if(ret === undefined) continue;
            self.postHoc(self, action, target, ret);
        }
    }

    fine(tagName: string, newClass: {new(): HTMLElement}){
        customElements.define(tagName, newClass);
    }

    getAttrNames(props: {[key: string]: PropInfo}, toLisp: (s: string) => string, ext: any){
        const returnArr: string[] = ext.observedAttributes || [];
        for(const key in props){
            const prop = props[key];
            if(prop.parse){
                returnArr.push(toLisp((key)));
            }
        }
        return returnArr;
    }

    getProps(self: this, action: Action): Set<string>{
        return new Set<string>([...(action.ifAllOf || []) as string[], ...(action.ifKeyIn || []) as string[]]);
    }

    postHoc(self: this, action: Action, target: any, returnVal: any){
        Object.assign(target, returnVal);
    }

    pq(self: this, expr: LogicOp<any>, src: MCProps, ctx: LogicEvalContext = {op:'and'}): boolean{
        const {ifAllOf} = expr;
        const {pqs} = self;
        if(ifAllOf !== undefined){
            if(!pqs(self, ifAllOf as ListOfLogicalExpressions, src, ctx)) return false;
        }
        return true;
    }
    
    pqsv(self: this, src: any, subExpr: string | number | symbol | LogicOp<any>, ctx: LogicEvalContext): boolean{
        return !!src[subExpr as any as string];
    }
    pqs(self: this, expr: ListOfLogicalExpressions,  src: MCProps, ctx: LogicEvalContext): boolean{
        for(const subExpr of expr){
            if(!self.pqsv(self, src, subExpr, ctx)) return false;
        }
        return true;
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

    toLisp(s: string){return s.split(ctlRe).join('-').toLowerCase();}
    toCamel(s: string){return s.replace(stcRe, function(m){return m[1].toUpperCase();});}
}

const QR = (propName: string, self: HasPropChangeQueue) => {
    if(self.propChangeQueue === undefined) self.propChangeQueue = new Set<string>();
    self.propChangeQueue.add(propName);
}


const ctlRe = /(?=[A-Z])/;
const stcRe = /(\-\w)/g;



