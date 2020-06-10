import {IHydrate, EvaluatedAttributeProps} from './types.js';

type Constructor<T = {}> = new (...args: any[]) => T;

interface attrArgs{
    name: string,
    val: string | boolean | null,
    trueVal: string | undefined
}

//export const propUp: unique symbol = Symbol.for('8646ccd5-3ffd-447a-a4df-0022ca3a8155');
//export const attribQueue: unique symbol = Symbol.for('02ca2c80-68e0-488f-b4b4-6859284848fb');
 
/**
 * Base mixin for many xtal- components
 * @param superClass
 */
export function hydrate<TBase extends Constructor<HTMLElement>>(superClass: TBase) {
    return class extends superClass implements IHydrate {

        static defaultValues : any;

        #attribQueue: attrArgs[] | undefined;
        #conn = false;
        /**
         * Set attribute value.
         * @param name 
         * @param val 
         * @param trueVal String to set attribute if true.
         */
        attr(name: string, val?: string | boolean | null, trueVal?: string) {
            if(val === undefined) return this.getAttribute(name);
            if(!this.#conn){
                if(this.#attribQueue === undefined) this.#attribQueue = [];
                this.#attribQueue!.push({
                    name, val, trueVal
                });
                return;
            }
            const v = val ? 'set' : 'remove';  //verb
            (<any>this)[v + 'Attribute'](name, trueVal || val);

        }

        /**
         * Any component that emits events should not do so if it is disabled.
         * @attr
         */
        disabled!: boolean;

        /**
         * Needed for asynchronous loading
         * @param props Array of property names to "upgrade", without losing value set while element was Unknown
         */
        __propUp(props: string[]) { //https://github.com/denoland/deno/issues/5258
            const defaultValues = (<any>this.constructor)['defaultValues'];
            props.forEach(prop => {
                if (this.hasOwnProperty(prop)) {
                    let value = (<any>this)[prop];
                    if(value === undefined && defaultValues !== undefined){
                        value = defaultValues[prop];
                    }
                    delete (<any>this)[prop];
                    (<any>this)[prop] = value;
                }
            });
        }
        
        connectedCallback(){
            this.#conn = true;
            const ep = (<any>this.constructor).props as EvaluatedAttributeProps;
            this.__propUp([...ep.bool, ...ep.str, ...ep.num, ...ep.obj]);
            if(this.#attribQueue !== undefined){
                this.#attribQueue!.forEach(attribQItem =>{
                    this.attr(attribQItem.name, attribQItem.val, attribQItem.trueVal);
                })
                this.#attribQueue = undefined;
            }
        }
    }
}

