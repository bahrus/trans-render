import {IHydrate, EvaluatedAttributeProps} from './types.js';

type Constructor<T = {}> = new (...args: any[]) => T;

interface attrArgs{
    name: string,
    val: string | boolean | null,
    trueVal: string | undefined
}

/**
 * Base mixin for many xtal- components
 * @param superClass
 */
export function hydrate<TBase extends Constructor<HTMLElement>>(superClass: TBase) {
    return class extends superClass implements IHydrate {
        _attribQueue: attrArgs[] | undefined;
        /**
         * Set attribute value.
         * @param name 
         * @param val 
         * @param trueVal String to set attribute if true.
         */
        attr(name: string, val: string | boolean | null, trueVal?: string) {
            if(!this.isConnected){
                if(this._attribQueue === undefined) this._attribQueue = [];
                this._attribQueue.push({
                    name, val, trueVal
                });
                return;
            }
            const v = val ? 'set' : 'remove';  //verb
            (<any>this)[v + 'Attribute'](name, trueVal || val);

        }

        /**
         * Any component that emits events should not do so if it is disabled.
         * Note that this is not enforced, but the disabled property is made available.
         * Users of this mix-in should ensure not to call "de" if this property is set to true.
         * @attr
         */
        disabled = false;

        /**
         * Needed for asynchronous loading
         * @param props Array of property names to "upgrade", without losing value set while element was Unknown
         */
        propUp<TKeys extends string[] = string[]>(props: TKeys) {
            props.forEach(prop => {
                if (this.hasOwnProperty(prop)) {
                    let value = (<any>this)[prop];
                    delete (<any>this)[prop];
                    (<any>this)[prop] = value;
                }
            })

        }
        connectedCallback(){
            const ep = (<any>this.constructor).props as EvaluatedAttributeProps;
            this.propUp([...ep.bool, ...ep.str, ...ep.num, ...ep.obj]);
            if(this._attribQueue !== undefined){
                this._attribQueue.forEach(attribQItem =>{
                    this.attr(attribQItem.name, attribQItem.val, attribQItem.trueVal);
                })
                delete this._attribQueue;
            }
        }
    }
}

