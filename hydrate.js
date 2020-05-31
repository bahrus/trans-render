/**
 * Base mixin for many xtal- components
 * @param superClass
 */
export function hydrate(superClass) {
    return class extends superClass {
        constructor() {
            super(...arguments);
            /**
             * Any component that emits events should not do so if it is disabled.
             * Note that this is not enforced, but the disabled property is made available.
             * Users of this mix-in should ensure not to call "de" if this property is set to true.
             * @attr
             */
            this.disabled = false;
        }
        /**
         * Set attribute value.
         * @param name
         * @param val
         * @param trueVal String to set attribute if true.
         */
        attr(name, val, trueVal) {
            if (!this.isConnected) {
                if (this._attribQueue === undefined)
                    this._attribQueue = [];
                this._attribQueue.push({
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
        propUp(props) {
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
            this.propUp([...ep.bool, ...ep.str, ...ep.num, ...ep.obj]);
            if (this._attribQueue !== undefined) {
                this._attribQueue.forEach(attribQItem => {
                    this.attr(attribQItem.name, attribQItem.val, attribQItem.trueVal);
                });
                delete this._attribQueue;
            }
        }
    };
}
