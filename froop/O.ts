import {RoundaboutReady, WCConfig, BaseProps, PropInfo, PropInfoTypes} from './types';


const publicPrivateStore = Symbol();

export class O<TProps=any, TActions=TProps> extends HTMLElement implements RoundaboutReady{
    propagator = new EventTarget();
    [publicPrivateStore]: Partial<TProps> = {};

    covertAssignment(obj: TProps): void {
        Object.assign(this[publicPrivateStore], obj);
    }
    constructor(){
        super();
    }

    async connectedCallback(){
        const props = (<any>this.constructor).props as {[key: string]: PropInfo};
        this.#propUp(props);
        await this.mount();
    }

    async mount(){
        
        const config = (<any>this.constructor).config as WCConfig;
        const {actions} = config;
        if(actions !== undefined){
            const {roundabout} = await import('./roundabout.js');
            await roundabout(this, {
                //propagator: this.propagator,
                actions
            });
        }

    }
    
    
    #parseAttr(propInfo: PropInfo, name: string, ov: string | null, nv: string | null){
        //TODO support memoized parse
        const {type} = propInfo;
        if(nv === null){
            if(type === 'Boolean') return false;
            return undefined;
        }
        switch(type){
            case 'Boolean':
                return true;
            case 'Number':
                return Number(nv);
            case 'Object':
                return JSON.parse(nv);
            case 'RegExp':
                return new RegExp(nv);
            case 'String':
                return nv;
        }
    }
    /**
     * Needed for asynchronous loading
     * @param props Array of property names to "upgrade", without losing value set while element was Unknown
     * @param defaultValues:   If property value not set, set it from the defaultValues lookup
     * @private
     */
    #propUp<T>(props: {[key: string]: PropInfo}){
        for(const key in props){
            const propInfo = props[key];
            let value = (<any>this)[key];
            if(value === undefined){
                const {def, parse, attrName} = propInfo;
                if(parse && attrName){
                    value = this.#parseAttr(propInfo, attrName, null, this.getAttribute(attrName)); 
                }
                if(value === undefined) value = def;
                if(value === undefined){
                    continue;
                }
                
            }
            if(value !== undefined){
                if (this.hasOwnProperty(key)) {
                    delete (<any>this)[key];
                }
                (<any>this)[key] = value;
            }

        }
        this.proppedUp = true;
    }
    static addProps(newClass: {new(): O}, props: {[key: string]: PropInfo}){
        const proto = newClass.prototype;
        for(const key in props){
            if(key in proto) continue;
            const prop = props[key];
            if(prop.ro){
                Object.defineProperty(proto, key, {
                    get(){
                        return this[publicPrivateStore][key];
                    },
                    enumerable: true,
                    configurable: true,
                });
            }else{
                Object.defineProperty(proto, key, {
                    get(){
                        return this[publicPrivateStore][key];
                    },
                    set(nv: any){
                        const ov = this[publicPrivateStore][key];
                        if(prop.dry && ov === nv) return;
                        this[publicPrivateStore][key] = nv;
                        (this as O).propagator.dispatchEvent(new Event(key));
                    },
                    enumerable: true,
                    configurable: true,
                });
            }

        }
    }
    attributeChangedCallback(name: string, oldVal: string | null, newVal: string | null){
        if(!this.proppedUp) return;
        const config = (<any>this.constructor).config as WCConfig;
        // const newAttrs = this.#newAttrs;
        // const filteredAttrs = this.#filteredAttrs;
        // newAttrs[name] = {oldVal, newVal};
        // if(newVal === null){
        //     delete filteredAttrs[name];
        // }else{
        //     filteredAttrs[name] =newVal;
        // }
        // //TODO:  optimize this
        // if(this.#checkIfAttrsAreParsed()){
        //     services!.definer.dispatchEvent(new CustomEvent(acb, {
        //         detail: {
        //             instance: this as any as HTMLElement,
        //             newAttrs,
        //             filteredAttrs
        //         }  as IAttrChgCB
                
        //     }));
        //     this.#newAttrs = {};
        // }else{
        //     this.isAttrParsed = false;
        // }
        

    }
    static config: WCConfig | undefined;
    static async bootUp(){
        const config = this.config!;
        const {propDefaults} = config;
        if(propDefaults !== undefined){
            const props = this.props;
            for(const key in propDefaults){
                const def = propDefaults[key];
                const propInfo = {
                    ...defaultProp,
                    def 
                };
                this.setType(propInfo, def);
                props[key] = propInfo;
            }
            this.addProps(this, props);
        }
    }

    static setType(prop: PropInfo, val: any){
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
    static props: {[key: string]: PropInfo} = {};
}

export interface O extends BaseProps{}


const defaultProp: PropInfo = {
    type: 'Object',
    dry: true,
    parse: true,
};

const baseConfig: WCConfig<BaseProps> = {
    propDefaults:{
        proppedUp: false,
    }
};