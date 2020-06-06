export const propUp = Symbol.for('8646ccd5-3ffd-447a-a4df-0022ca3a8155');
export const attribQueue = Symbol.for('02ca2c80-68e0-488f-b4b4-6859284848fb');
/**
 * Base mixin for many xtal- components
 * @param superClass
 */
export function hydrate(superClass) {
    return class extends superClass {
        /**
         * Set attribute value.
         * @param name
         * @param val
         * @param trueVal String to set attribute if true.
         */
        attr(name, val, trueVal) {
            if (val === undefined)
                return this.getAttribute(name);
            if (!this.xlConnected) {
                if (this[attribQueue] === undefined)
                    this[attribQueue] = [];
                this[attribQueue].push({
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
         */
        [propUp](props) {
            props.forEach(prop => {
                if (this.hasOwnProperty(prop)) {
                    let value = this[prop];
                    delete this[prop];
                    this[prop] = value;
                }
            });
        }
        connectedCallback() {
            const ep = this.constructor.props;
            this[propUp]([...ep.bool, ...ep.str, ...ep.num, ...ep.obj]);
            if (this[attribQueue] !== undefined) {
                this[attribQueue].forEach(attribQItem => {
                    this.attr(attribQItem.name, attribQItem.val, attribQItem.trueVal);
                });
                delete this[attribQueue];
            }
        }
    };
}
