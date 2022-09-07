import { DefineArgs, LogicOp, LogicEvalContext, LogicOpProp, PropInfo, HasPropChangeQueue, Action, PropInfoTypes, PropChangeInfo, PropChangeMoment, ListOfLogicalExpressions, TRElementProps, PropChangeMethod, TRElementActions, WCConfig } from './types.js';
export { Action, PropInfo, TRElementActions, TRElementProps, WCConfig} from './types.js';
import { def } from './def.js';
//import { doActions } from './doActions.js';

export class CE<MCProps = any, MCActions = MCProps, TPropInfo = PropInfo, TAction extends Action<MCProps> = Action<MCProps>>{
    
    constructor(public args?: DefineArgs<MCProps, MCActions, TPropInfo, TAction>){
        if(args !== undefined) {
            this.#evalConfig(this).then(() => {
                this.def(args);
            })
            
        }
    }

    async #evalConfig({args}: this){
        if(args === undefined) return;
        const {config} = args;
        if(typeof config != 'function') return;
        args.config = (await config()).default;
    }

    defaultProp: PropInfo = {
        type: 'Object',
        dry: true,
        parse: true,
    };

    act2Props: {[key:string]: Set<string>} = {};

    doPA(self: this, src: any, pci: PropChangeInfo, m: PropChangeMoment){}

    async #createPropInfos<MCProps, MCActions, TPropInfo>(args: DefineArgs<MCProps, MCActions, TPropInfo>){
        const {defaultProp, setType} = this;
        const config  = args.config as WCConfig;
        const props: {[key: string]: PropInfo} = {};
        const defaults = {...args.complexPropDefaults, ...config.propDefaults} as any;
        for(const key in defaults){
            const prop: PropInfo = {...defaultProp};
            setType(prop, defaults[key]);
            props[key] = prop;
        }
        const specialProps = config.propInfo;
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
        const actions = config.actions;
        if(actions !== undefined){
            for(const methodName in actions){
                const action = actions[methodName];
                const typedAction = (typeof action === 'string') ? {ifAllOf:[action]} as Action : action! as Action;
                const upon = this.getProps(this, typedAction);
                for(const dependency of upon){
                    if(props[dependency] === undefined){
                        const prop: PropInfo = {...defaultProp};
                        props[dependency] = prop;
                    }
                }
            }
        }
        await this.api(args, props);
        return props;
    }
    async api<MCProps, MCActions, TPropInfo>(args: DefineArgs<MCProps, MCActions, TPropInfo>, props: {[key: string]: PropInfo}){
        //overridable placeholder for adding additional props
    }

    classDef: {new(): MCProps & MCActions & TRElementProps & HTMLElement} | undefined;
    async def(args: DefineArgs<MCProps, MCActions, TPropInfo, TAction>): Promise<{new(): MCProps & MCActions}>{
        this.args = args;
        await this.#evalConfig(this);
        const {getAttrNames: getAttributeNames, doActions, fine, pq, toCamel, toLisp, propUp, getProps} = this;
        const self = this;
        const {config} = args;
        const {tagName, style, actions} = config as WCConfig;
        const propInfos  = await this.#createPropInfos(args);
        let ext = (args.superclass || HTMLElement) as {new(): any};
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



        class newClass extends ext implements TRElementProps, TRElementActions{

            static is = tagName;
            static observedAttributes = getAttributeNames(propInfos, toLisp, ext);
            static reactiveProps = propInfos;
            static ceDef = args;
            static formAssociated = (config as WCConfig).formAss;
            constructor(){
                super();
                this.internals_ = this.attachInternals();
                this.attachQR();
            }
            #mergedActions: Partial<{[key in keyof MCActions]: TAction}> | undefined;
            get mergedActions(){
                if(this.#mergedActions === undefined){
                    this.#mergedActions = super.mergedActions || {};
                    Object.assign(this.#mergedActions!, actions);
                }
                return this.#mergedActions!;
            }
            #values: {[key: string]: any} = {};
            getValues(){
                return this.#values;
            }
            attributeChangedCallback(n: string, ov: string, nv: string){
                if(super.attributeChangedCallback) super.attributeChangedCallback(n, ov, nv);
                if(n === 'defer-hydration' && nv === null && ov !== null){
                    this.detachQR();
                }

                let propName = toCamel(n);
                const prop = propInfos[propName];
                //if(this.inReflectMode) propName = '_' + propName;
                if(prop !== undefined){
                    if(prop.dry && ov === nv) return;
                    const aThis: any = this.inReflectMode ? this.#values :  this as any;
                    switch(prop.type){
                        case 'String':
                            aThis[propName] = nv;
                            break;
                        case 'Object':
                            if(prop.parse){
                                let val = nv.trim();
                                if(val!==null){
                                    try{
                                        val = JSON.parse(val);
                                    }catch(e){
                                        console.error({val, e});
                                    }
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
                        case 'RegExp':
                            aThis[propName] = new RegExp(nv);
                            break;
                    }
                }
            }
            async connectedCallback(myArgs = undefined){ //TODO:  problematic
                Object.assign(this.style, style);
                const args = myArgs || (<any>this.constructor).ceDef;
                const defaults: any = {...args.config.propDefaults, ...args.complexPropDefaults};
                propUp(this as any as HTMLElement, Object.keys(propInfos), defaults);
                if(super.connectedCallback) super.connectedCallback(super.constructor.ceDef);
                await this.detachQR();
            }
    
            attachQR(){
                this.QR = QR;
            }
            async detachQR(){
                if(this.hasAttribute('defer-hydration')) return;
                delete this.QR;
                const propChangeQueue = this.propChangeQueue as Set<string> | undefined;
                const acts = this.mergedActions;
                const actionsToDo: any = {};
                if(propChangeQueue !== undefined && acts !== undefined){
                    for(const doAct in acts){
                        let action = acts[doAct] as Action;
                        if(typeof action === 'string'){
                            action = {ifAllOf: [action]};
                        }
                        const props = getProps(self, action); //TODO:  Cache this
                        let actionIsApplicable = false;
                        for(const prop of props){
                            if(propChangeQueue.has(prop)){
                                actionIsApplicable = await pq(self, action, this as any as MCProps);
                                if(actionIsApplicable){
                                    break;
                                }
                            }
                        }
                        if(!actionIsApplicable) continue;
                        actionsToDo[doAct] = action;
                    }
                }
                await doActions(self as CE, actionsToDo, this);
                delete this.propChangeQueue;
            }
            setValsQuietly(vals: this){
                for(const key in vals){
                    (<any>this)['_' + key] = vals[key];
                }
            }

        }

        interface newClass extends TRElementProps{};
        if(Object.keys(propInfos).length > 0){
            const {addProps} = await import('./addProps.js');
            await addProps(this as CE, newClass as any as {new(): HTMLElement}, propInfos, args)
        }
        fine(tagName!, newClass as any as ({new(): HTMLElement}));
        this.classDef = newClass as any as {new(): MCProps & MCActions & TRElementProps & HTMLElement};
        return this.classDef;
    }

    async doActions(self: CE, actions: {[methodName: string]: Action}, target: any, proxy?: any){
        const {doActions} = await  import('./doActions.js');
        await doActions(self, actions, target, proxy);
    }

    fine(tagName: string, newClass: {new(): HTMLElement}){
        def(newClass);
    }

    getAttrNames(props: {[key: string]: PropInfo}, toLisp: (s: string) => string, ext: any){
        const returnArr: string[] = ext.observedAttributes || [];
        for(const key in props){
            const prop = props[key];
            if(prop.parse){
                returnArr.push(toLisp((key)));
            }
        }
        returnArr.push('defer-hydration');
        return returnArr;
    }

    //better name:  getPropsFromActions
    getProps(self: this, action: Action): Set<string>{
        return typeof(action) === 'string' ? new Set<string>([action]) : new Set<string>([...(action.ifAllOf || []) as string[], ...(action.ifKeyIn || []) as string[]]);
    }

    async postHoc(self: this, action: Action, target: any, returnVal: any, proxy?: any){
        const dest = proxy !== undefined ? proxy : target;
        Object.assign(dest, returnVal);
        const setFree = action.setFree;
        if(setFree !== undefined){
            for(const key of setFree){
                dest[key] = undefined;
            }
        }
    }

    async pq(self: this, expr: LogicOp<any>, src: MCProps, ctx: LogicEvalContext = {op:'and'}): Promise<boolean>{
        const {ifAllOf} = expr;
        const {pqs} = self;
        if(ifAllOf !== undefined){
            if(!await pqs(self, ifAllOf as ListOfLogicalExpressions, src, ctx)) return false;
        }
        return true;
    }
    
    async pqsv(self: this, src: any, subExpr: string | number | symbol | LogicOp<any>, ctx: LogicEvalContext): Promise<boolean>{
        return !!src[subExpr as any as string];
    }
    async pqs(self: this, expr: ListOfLogicalExpressions,  src: MCProps, ctx: LogicEvalContext): Promise<boolean>{
        for(const subExpr of expr){
            if(!await self.pqsv(self, src, subExpr, ctx)) return false;
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
            if(val instanceof RegExp){
                prop.type = 'RegExp';
            }else{
                let t: string = typeof(val);
                t = t[0].toUpperCase() + t.substr(1);
                prop.type = t as PropInfoTypes;
            }

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



