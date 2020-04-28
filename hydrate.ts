import {IHydrate} from './types.js';

export const disabled = 'disabled';
//export const propUp : symbol = setSymbol(TRS.is,'propUp'); //Typescript can't handle this (yet?)

type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * Base mixin for many xtal- components
 * @param superClass
 */
export function hydrate<TBase extends Constructor<HTMLElement>>(superClass: TBase) {
    return class extends superClass implements IHydrate {
        static get observedAttributes() {
            return [disabled];
        }

        attributeChangedCallback(name: string, oldVal: string, newVal: string) {
            switch (name) {
                case disabled:
                    this._disabled = newVal !== null;
                    break;
            }
        }

        /**
         * Set attribute value.
         * @param name 
         * @param val 
         * @param trueVal String to set attribute if true.
         */
        attr(name: string, val: string | boolean | null, trueVal?: string) {
            const v = val ? 'set' : 'remove';  //verb
            (<any>this)[v + 'Attribute'](name, trueVal || val);

        }

        _disabled!: boolean;

        get disabled() {
            return this._disabled;
        }
        /**
         * Any component that emits events should not do so if it is disabled.
         * Note that this is not enforced, but the disabled property is made available.
         * Users of this mix-in should ensure not to call "de" if this property is set to true.
         * @attr
         */
        set disabled(val) {
            this.attr(disabled, val, '');
        }

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
    }
}

