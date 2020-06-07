var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
//export const propUp: unique symbol = Symbol.for('8646ccd5-3ffd-447a-a4df-0022ca3a8155');
//export const attribQueue: unique symbol = Symbol.for('02ca2c80-68e0-488f-b4b4-6859284848fb');
/**
 * Base mixin for many xtal- components
 * @param superClass
 */
export function hydrate(superClass) {
    var _attribQueue, _conn, _a;
    return _a = class extends superClass {
            constructor() {
                super(...arguments);
                _attribQueue.set(this, void 0);
                _conn.set(this, false);
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
                if (!__classPrivateFieldGet(this, _conn)) {
                    if (__classPrivateFieldGet(this, _attribQueue) === undefined)
                        __classPrivateFieldSet(this, _attribQueue, []);
                    __classPrivateFieldGet(this, _attribQueue).push({
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
            __propUp(props) {
                props.forEach(prop => {
                    if (this.hasOwnProperty(prop)) {
                        let value = this[prop];
                        delete this[prop];
                        this[prop] = value;
                    }
                });
            }
            connectedCallback() {
                __classPrivateFieldSet(this, _conn, true);
                const ep = this.constructor.props;
                this.__propUp([...ep.bool, ...ep.str, ...ep.num, ...ep.obj]);
                if (__classPrivateFieldGet(this, _attribQueue) !== undefined) {
                    __classPrivateFieldGet(this, _attribQueue).forEach(attribQItem => {
                        this.attr(attribQItem.name, attribQItem.val, attribQItem.trueVal);
                    });
                    __classPrivateFieldSet(this, _attribQueue, undefined);
                }
            }
        },
        _attribQueue = new WeakMap(),
        _conn = new WeakMap(),
        _a;
}
