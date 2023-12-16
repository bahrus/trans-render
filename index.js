import { MountObserver } from 'mount-observer/MountObserver.js';
export class Transformer extends EventTarget {
    target;
    model;
    manifest;
    constructor(target, model, manifest) {
        super();
        this.target = target;
        this.model = model;
        this.manifest = manifest;
    }
}
const reCssKeyTo;
export class TransformBinding extends EventTarget {
    cssKey;
    #mountObserver;
    #propDependencies;
    constructor(cssKey) {
        super();
        this.cssKey = cssKey;
        this.#mountObserver = new MountObserver({
            match: cssKey, //TODO, use special Key
        });
        this.#propDependencies = [];
    }
    handleCSSMatch() {
    }
}
