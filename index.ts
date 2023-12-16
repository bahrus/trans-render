import {MountObserver} from 'mount-observer/MountObserver.js';
import {TransformerTarget, Model, FragmentManifest} from './types';

export class Transformer extends EventTarget {
    constructor(
        public target: TransformerTarget, 
        public model: Model,
        public manifest: FragmentManifest){
        super();
    }
}

const reCssKeyTo

export class TransformBinding extends EventTarget{
    #mountObserver: MountObserver;
    #propDependencies: string[];
    constructor(public cssKey: string){
        super();
        this.#mountObserver = new MountObserver({
            match: cssKey,//TODO, use special Key
        });
        this.#propDependencies = [];
    }
    handleCSSMatch(){

    }
}