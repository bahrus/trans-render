import {RRMixin} from './RRMixin.js';
import {assignGingerly} from '../lib/assignGingerly.js';
import {
    RoundaboutReady, BaseProps, PropInfo, PropInfoTypes, 
    IshPropLookup, IshConfig, PropLookup,
    ExtHandlerOptions} from '../ts-refs/trans-render/froop/types.js';
import { RoundAbout } from './roundabout.js';
import { MountObserver } from 'mount-observer/MountObserver.js';
import {Ishcycle} from '../ts-refs/mount-observer/types.js';
export {regIsh} from 'mount-observer/refid/regIsh.js';

const publicPrivateStore = Symbol();

export class Scope<TProps = any, TActions = TProps> 
    extends RRMixin(EventTarget) implements Ishcycle{
    propagator = new EventTarget();
    [publicPrivateStore]: Partial<TProps> = {};

    #elRef: WeakRef<Element> | undefined;

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

    channelEvent(event: Event){
        (<any>event).enh = 'ish';
        this.#elRef?.deref()?.dispatchEvent(event);
    }

    async 'arr=>'(self: Scope, arr: any[]){
        if(!this.#config) return arr;
        const {ishListCountProp, defaultIshList} = this.#config;
        const returnArr = arr || defaultIshList;
        if(ishListCountProp !== undefined){
            (<any>this)[ishListCountProp] = returnArr === undefined ? 0 : returnArr.length;;
        }
        return returnArr;
    }

    /**
     * This gets called when an element is adorned by the itemscope=my-element
     * @param el
     */
    async '<mount>'(self: Scope, el: Element){
        this.#elRef = new WeakRef(el);
        const config = this.#config || {};
        const {propDefaults, propInfo, xform, mapParentScopeRefTo, ignoreItemProp, mapElTo, extHandlers} = config;
        //TODO: support propDefaults
        if(propInfo !== undefined){
            this.#propUp(propInfo);
        }
        await this.#instantiateRoundaboutIfApplicable();

        
        if(xform !== undefined) {
            const {Transform} = await import('../Transform.js');
            await Transform(el, this, xform, {
                propagator: this.propagator,
                propagatorIsReady: true,
                outside: '[itemscope]',
            });
        };

        if(extHandlers !== undefined){
            const {ExtHandler} = await import('./ExtHandler.js');
            for(const key in extHandlers){
                new ExtHandler(el, self, key, extHandlers[key] as ExtHandlerOptions);
            }
             
        }

        //[TODO] make this private so can troubleshoot better
        //this.transform = transform;
        this.dispatchEvent(new Event('resolved'));
        const hasItemProp = el.hasAttribute('itemprop');
        if(mapParentScopeRefTo !== undefined || (hasItemProp && !ignoreItemProp)){
            //for now, assume that the parent scope will be an ancestor of el
            const parentScope = el.parentElement?.closest('[itemscope]:not([itemscope=""])');
            if(parentScope){
                const ish = await (await import('mount-observer/waitForIsh.js')).waitForIsh(parentScope);
                if(mapParentScopeRefTo !== undefined){
                    (<any>self)[mapParentScopeRefTo] = new WeakRef(ish);
                }
                if(hasItemProp && !ignoreItemProp && (<any>ish).propagator instanceof EventTarget){
                    //if the parent scope has an itemprop, then we need to set it
                    //on the current scope
                    const itemProp = el.getAttribute('itemprop');
                    if(itemProp !== null){
                        (<any>el)['ish'] = (<any>ish)[itemProp];
                        new (await import('../asmr/BeLinked.js')).BeLinked(
                            ish as any as RoundaboutReady, itemProp, el, 'ish'
                        );
                    }
                }

            }
        }
        if(mapElTo !== undefined){
             (<any>self)[mapElTo] = new WeakRef(el);
        }


    }

    // #ref: WeakRef<Scope> | undefined;
    // #parentIsh: WeakRef<Scope> | undefined;
    // #itemprop: string | undefined;

    // #handleItemPropUpdate(){
    //     const el = this.#ref?.deref();
    //     if(el === undefined) return;
    //     const parentIsh = this.#parentIsh?.deref();
    //     if(parentIsh === undefined) return;
    //     const itemProp = this.#itemprop;
    //     if(itemProp === undefined) return;
    //     (<any>el)['ish'] = (<any>parentIsh)[itemProp];
    // }


    #scopeIndex = 0;
    /**
     * This get invoked if the element with the itemscope=my-element
     * attribute has an itemref attribute, and one of the elements with id matching 
     * the itemref is found.
     * @param el 
     */
    async '<inScope>'(self: Scope, el: Element){
        const inScopeXForms = this.#config.inScopeXForms;
        if(inScopeXForms === undefined) return;
        const {Transform} = await import('../Transform.js');
        for(const cssQuery in inScopeXForms){
            if(!el.matches(cssQuery)) continue;
            const xform = inScopeXForms[cssQuery];
            await Transform(el, this, xform, {
                propagator: this.propagator,
                propagatorIsReady: true,
            });
        }
        
        
    }



    async #instantiateRoundaboutIfApplicable(){
        
        const config = this.#config || {};
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

    #propUp<T>(props: PropLookup){
        for(const key in props){
            const propInfo = props[key]!;
            let value = (<any>this)[key];
            if(value === undefined){
                value = propInfo.def;
            }
            if(value !== undefined){
                (<any>this[publicPrivateStore])[key] = value;
            }
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
        const config = this.config;
        if(config === undefined) return;
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

export interface Scope extends RoundaboutReady {}

const defaultProp: PropInfo = {
    type: 'Object',
    dry: true,
    parse: false,
};