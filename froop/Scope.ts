import {RRMixin} from './RRMixin.js';
import {assignGingerly} from '../lib/assignGingerly.js';
import {
    RoundaboutReady, BaseProps, PropInfo, PropInfoTypes, 
    IshPropLookup, IshConfig} from '../ts-refs/trans-render/froop/types.js';
import { RoundAbout } from './roundabout.js';

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
     * provided for debugging purposes
     * so don't remove it even though no references to it other than initialization
     */
    #roundabout: RoundAbout | undefined;

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
                        (this as Mo).propagator.dispatchEvent(new Event(key));
                        
                    },
                    enumerable: true,
                    configurable: true,
                });
            }

        }
    }

    static config: IshConfig | undefined;
}