import {RRMixin} from './RRMixin.js';
import {assignGingerly} from '../lib/assignGingerly.js';
import {
    RoundaboutReady, BaseProps, PropInfo, PropInfoTypes, 
    IshPropLookup, IshConfig} from '../ts-refs/trans-render/froop/types.js';
import { RoundAbout } from './roundabout.js';
import { MountObserver } from 'mount-observer/MountObserver.js';

const publicPrivateStore = Symbol();

export class Scope<TProps = any, TActions = TProps> 
    extends RRMixin(HTMLElement){
    propagator = new EventTarget();
    [publicPrivateStore]: Partial<TProps> = {};

    async covertAssignment(obj: TProps){
        const props = (<any>this.constructor).props as IshPropLookup;
        const extObj: any = {};
        for(const key in obj){
            const prop = props[key];
            const val = obj[key];
            if(prop === undefined) throw 403;
            extObj[key] = val;
        }
        await assignGingerly(this[publicPrivateStore], extObj);

    }

    /**
     * This gets called when an element is adorned by the itemscope=my-element
     * @param el
     */
    async attachedCallback(el: Element){
        await this.#instantiateRoundaboutIfApplicable();
        const xform = this.#config.xform;
        if(xform === undefined) return;
        const {Transform} = await import('../Transform.js');
        await Transform(el, this, xform, {
            propagator: this.propagator,
            propagatorIsReady: true,
        });
    }

    async detachedCallback(el: Element){}

    #scopeIndex = 0;
    /**
     * This get invoked if the element with the itemscope=my-element
     * attribute has an itemref attribute, and one of the elements with id matching 
     * the itemref is found.
     * @param el 
     */
    async inScopeCallback(el: Element){
        const inScopeXForms = this.#config.inScopeXForms;
        if(inScopeXForms === undefined) return;
        const xform = inScopeXForms[this.#scopeIndex++];
        if(xform === undefined) return;
        const {Transform} = await import('../Transform.js');
        await Transform(el, this, xform, {
            propagator: this.propagator,
            propagatorIsReady: true,
        });
    }

    /**
     * This get invoked if the element with the itemscope=my-element
     * attribute has an itemref attribute, and one of the elements with id matching 
     * the itemref is removed from the DOM tree.
     * @param el 
     */
    async outOfScopeCallback(el: Element){
    }

    async #instantiateRoundaboutIfApplicable(){
        
        const config = this.#config;
        const {actions, compacts, infractions, handlers, positractions, isSleepless} = config;
        if((actions || compacts || infractions || handlers || positractions) !== undefined){
            let mountObservers: Set<MountObserver> | undefined;
            if(!isSleepless){
                const {guid} = await import('mount-observer/MountObserver.js');
                mountObservers = (<any>this)[guid];
            }
            const {roundabout} = await import('./roundabout.js');
            const [vm, ra] = await roundabout({
                vm: this,
                actions,
                compacts,
                handlers,
                positractions,
                mountObservers
            }, infractions);
            this.#roundabout = ra;
        }
        
    }

    /**
     * provided for debugging purposes
     * so don't remove it even though no references to it other than initialization
     */
    #roundabout: RoundAbout | undefined;

    get #config(){
        return (<any>this.constructor).config as IshConfig;
    }

    static addProps(newClass: {new(): Scope}, props: IshPropLookup){
        const proto = newClass.prototype;
        for(const key in props){
            if(key in proto) continue;
            const prop = props[key]!;
            const {ro, adjuster} = prop;
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
                        let adjustedNV = nv;
                        if(adjuster !== undefined){
                            if(typeof adjuster === 'function'){
                                adjustedNV = adjuster(nv);
                            }else{
                                adjustedNV = this[adjuster](nv);
                            }
                        }
                        const ov = this[publicPrivateStore][key];
                        if(prop.dry && ov === adjustedNV) return;
                        this[publicPrivateStore][key] = adjustedNV;
                        (this as Scope).propagator.dispatchEvent(new Event(key));
                        
                    },
                    enumerable: true,
                    configurable: true,
                });
            }

        }
    }

    static config: IshConfig | undefined;

    static async bootUp(){
        const config = this.config!;
        const {propDefaults, propInfo, wrappers} = config;
        const props = {...this.props as IshPropLookup};
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
                if(propInfo.type !== 'Object' && def !== true){
                    propInfo.parse = true;
                    const {camelToLisp} = await import('../lib/camelToLisp.js');
                    propInfo.attrName = camelToLisp(key);
                }
                props[key] = propInfo;

            }
            
        }
        if(propInfo !== undefined){
            for(const key in propInfo){
                const prop = propInfo[key]!;
                const mergedPropInfo = {
                    ...props[key],
                    ...defaultProp,
                    ...prop,
                    propName: key
                } as PropInfo
                props[key] = mergedPropInfo;
                const {parse, attrName} = mergedPropInfo;

            }
        }
        this.props = props;
        this.addProps(this, props);
        if(wrappers !== undefined){
            const {addWrappers} = await import('./addWrappers.js');
            await addWrappers(this, wrappers);
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
    static props: IshPropLookup = {};
}

const defaultProp: PropInfo = {
    type: 'Object',
    dry: true,
    parse: false,
};