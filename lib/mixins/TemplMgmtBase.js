var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
import { transform } from '../transform.js';
import { getQuery } from '../specialKeys.js';
export { transform } from '../transform.js';
export const TemplMgmtBaseMixin = (superclass) => { var _repeatVisit, _isDSD, _a; return _a = class extends superclass {
        constructor() {
            super(...arguments);
            _repeatVisit.set(this, false);
            _isDSD.set(this, false);
        }
        cloneTemplate({ noshadow, shadowRoot, mainTemplate, styles }) {
            let root = this;
            if (!noshadow) {
                if (shadowRoot === null) {
                    root = this.attachShadow({ mode: 'open' });
                    if (styles !== undefined) {
                        root.adoptedStyleSheets = styles;
                    }
                }
                else {
                    root = this.shadowRoot;
                    if (!__classPrivateFieldGet(this, _repeatVisit, "f")) {
                        //assume the shadow root came from declarative shadow dom, so no need to clone template
                        if (styles !== undefined) {
                            //controversial!
                            root.adoptedStyleSheets = styles;
                        }
                        __classPrivateFieldSet(this, _isDSD, true, "f");
                        this.clonedTemplate = root;
                        __classPrivateFieldSet(this, _repeatVisit, true, "f");
                        return;
                    }
                }
            }
            if (__classPrivateFieldGet(this, _repeatVisit, "f")) {
                root.innerHTML = '';
            }
            this.clonedTemplate = mainTemplate.content.cloneNode(true);
            __classPrivateFieldSet(this, _repeatVisit, true, "f");
        }
        loadPlugins(self) { }
        doInitTransform({ clonedTemplate, noshadow }) {
            this.loadPlugins(this);
            transform(clonedTemplate, this.__ctx);
            this.doTemplMount(this, clonedTemplate);
            const propInfos = this.constructor['reactiveProps'];
            for (const refKey in propInfos) {
                const propInfo = propInfos[refKey];
                if (propInfo.isRef) {
                    const queryInfo = getQuery(refKey);
                    this[refKey] = clonedTemplate.querySelectorAll(queryInfo.query);
                }
            }
            const root = noshadow ? this : this.shadowRoot;
            if (!__classPrivateFieldGet(this, _isDSD, "f")) {
                root.appendChild(clonedTemplate);
            }
            else {
                __classPrivateFieldSet(this, _isDSD, false, "f");
            }
            this.clonedTemplate = undefined;
        }
        doTemplMount(self, clonedTemplate) { }
        doUpdateTransform(self) {
            this.__ctx.match = self.updateTransform;
            const root = self.noshadow ? self : self.shadowRoot;
            transform(root, this.__ctx);
        }
    },
    _repeatVisit = new WeakMap(),
    _isDSD = new WeakMap(),
    _a; };
export const doInitTransform = {
    cloneTemplate: {
        ifKeyIn: ['mainTemplate', 'noshadow']
    },
    doInitTransform: {
        ifAllOf: ['clonedTemplate'],
    }
};
