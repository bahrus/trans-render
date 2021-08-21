//export const propUp: unique symbol = Symbol.for('8646ccd5-3ffd-447a-a4df-0022ca3a8155');
//export const attribQueue: unique symbol = Symbol.for('02ca2c80-68e0-488f-b4b4-6859284848fb');
/**
 * Base mixin for many xtal- components
 * @param superClass
 */
export function hydrate(superClass) {
    return class extends superClass {
        constructor() {
            super(...arguments);
            this.__conn = false;
        }
        /**
         * Set attribute value.
         * @param name
         * @param val
         * @param trueVal String to set attribute if true.
         */
        attr(name, val, trueVal) {
            if (val === undefined)
                return this.getAttribute(name);
            if (!this.__conn) {
                if (this.__attribQueue === undefined)
                    this.__attribQueue = [];
                this.__attribQueue.push({
                    name, val, trueVal
                });
                return;
            }
            const v = val ? 'set' : 'remove'; //verb
            this[v + 'Attribute'](name, trueVal || val);
        }
        /**
         * Needed for asynchronous loading
         * @param props Array of property names to "upgrade", without losing value set while element was Unknown
         * @private
         */
        __propUp(props) {
            const defaultValues = this.constructor['defaultValues'];
            props.forEach(prop => {
                let value = this[prop];
                if (value === undefined && defaultValues !== undefined) {
                    value = defaultValues[prop];
                }
                if (this.hasOwnProperty(prop)) {
                    delete this[prop];
                }
                if (value !== undefined)
                    this[prop] = value;
            });
        }
        connectedCallback() {
            this.__conn = true;
            const ep = this.constructor.props;
            this.__propUp([...ep.bool, ...ep.str, ...ep.num, ...ep.obj]);
            if (this.__attribQueue !== undefined) {
                this.__attribQueue.forEach(attribQItem => {
                    this.attr(attribQItem.name, attribQItem.val, attribQItem.trueVal);
                });
                this.__attribQueue = undefined;
            }
        }
    };
}
