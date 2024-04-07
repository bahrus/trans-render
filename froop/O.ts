import {RoundaboutReady, WCConfig, BaseProps, PropInfo, PropInfoTypes, PropLookup, ICustomState} from './types';
//import {camelToLisp} from '../lib/camelToLisp.js';

const publicPrivateStore = Symbol();

export class O<TProps=any, TActions=TProps> extends HTMLElement implements RoundaboutReady{
    propagator = new EventTarget();
    [publicPrivateStore]: Partial<TProps> = {};

    covertAssignment(obj: TProps): void {
        Object.assign(this[publicPrivateStore], obj);
    }
    constructor(){
        super();
        this.#internals = this.attachInternals();
    }
    static observedAttributes: Array<string> = [];
    async connectedCallback(){
        const props = (<any>this.constructor).props as PropLookup;
        this.#propUp(props);
        await this.#mount();
        const states = (<any>this.constructor).props as PropLookup;
        if(Object.keys(states).length > 0){
            const {CustStSvc} = await import('./CustStSvc.js');
            new CustStSvc(states, this, this.#internals);
        }
    }

    disconnectedCallback(): any {
        this.propagator.dispatchEvent(new Event('unload'));
    }

    #internals: ElementInternals;
    // get internals(){

    // }

    async #mount(){
        
        const config = (<any>this.constructor).config as WCConfig;
        const {actions, compacts} = config;
        if(actions !== undefined){
            const {roundabout} = await import('./roundabout.js');
            await roundabout(this, {
                //propagator: this.propagator,
                actions,
                compacts
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
    #propUp<T>(props: PropLookup){
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
                (<any>this[publicPrivateStore])[key] = value;
                //(<any>this)[key] = value;
            }

        }
        this.proppedUp = true;
    }
    static addProps(newClass: {new(): O}, props: PropLookup){
        const proto = newClass.prototype;
        for(const key in props){
            if(key in proto) continue;
            const prop = props[key];
            const {ro, parse, attrName} = prop;
            if(ro){
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
            if(parse && attrName){
                this.observedAttributes.push(attrName);

            }
        }
    }
    attributeChangedCallback(name: string, oldVal: string | null, newVal: string | null){
        if(!this.proppedUp) return;
        const attrs = (<any>this.constructor).attrs as PropLookup;
        const propInfo = attrs[name];
        const val = this.#parseAttr(propInfo, name, oldVal, newVal);
        (<any>this)[propInfo.propName!] = val;
        
    }
    static config: WCConfig | undefined;
    
    static async bootUp(){
        const config = this.config!;
        const {propDefaults, propInfo} = config;
        const props = {...this.props, ...propInfo as PropLookup};
        const attrs = this.attrs;
        const states = this.states;
        Object.assign(props, propInfo);
        if(propDefaults !== undefined){
            for(const key in propDefaults){
                const def = propDefaults[key];
                const propInfo = {
                    ...defaultProp,
                    def,
                    propName: key
                } as PropInfo;
                this.setType(propInfo, def);
                if(propInfo.type !== 'Object'){
                    propInfo.parse = true;
                    const {camelToLisp} = await import('../lib/camelToLisp.js');
                    propInfo.attrName = camelToLisp(key);
                }
                props[key] = propInfo;
                if(propInfo.parse && propInfo.attrName){
                    attrs[key] = propInfo;
                }
            }
            
        }
        if(propInfo !== undefined){
            for(const key in propInfo){
                const prop = propInfo[key]!;
                prop.propName = key;
                const {parse, attrName, css} = prop;
                if(parse && attrName){
                    attrs[attrName] = prop;
                }
                if(css !== undefined){
                    states[key] = prop;
                }
            }
        }
        this.props = props;
        this.addProps(this, props);
        
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
    static props: PropLookup = {};
    static attrs: PropLookup = {};
    static states: PropLookup = {};
}

export interface O extends BaseProps{}


const defaultProp: PropInfo = {
    type: 'Object',
    dry: true,
    parse: false,
};

const baseConfig: WCConfig<BaseProps> = {
    propDefaults:{
        proppedUp: false,
    }
};