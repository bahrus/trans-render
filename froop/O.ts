import {RoundaboutReady, WCConfig, BaseProps, PropInfo} from './types';


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
        const {roundabout} = await import('./roundabout.js');
        await roundabout(this, {
            propagator: this.propagator,
            actions: ((<any>this.constructor).config as WCConfig).actions
        });
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
            if (this.hasOwnProperty(key)) {
                delete (<any>this)[key];
                (<any>this)[key] = value;
            }
        }
        this.proppedUp = true;
    }
    static #addProps(newClass: {new(): O}, props: {[key: string]: PropInfo}){
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
    static async bootUP(config: WCConfig){
        O.config = config;
    }
    static props: {[key: string]: PropInfo};
}

export interface O extends BaseProps{}



const baseConfig: WCConfig<BaseProps> = {
    propDefaults:{
        proppedUp: false,
    }
};