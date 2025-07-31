import { RoundaboutReady } from "../ts-refs/trans-render/froop/types";

export class BeLinked implements EventListenerObject {
    #srcRef: WeakRef<RoundaboutReady>;
    #destRef: WeakRef<any>;
    constructor(src: RoundaboutReady, public srcPath: string, dest: any, public destPath: string){
        //dest[destPath] = (<any>src)[srcPath];
        this.#srcRef = new WeakRef<RoundaboutReady>(src);
        this.#destRef = new WeakRef<any>(dest);
        src.propagator!.addEventListener(srcPath, this);
        this.handleEvent();
    }

    async handleEvent() {
        const src = this.#srcRef.deref(); if(!src) return;
        const dest = this.#destRef.deref(); if(!dest) return;
        const { srcPath, destPath } = this;
        const val = (<any>src)[srcPath];
        if(destPath.startsWith(('?.'))){
            (await import('../lib/setProp.js')).setProp(dest, destPath, val);
        }else{
            dest[this.destPath] = val;
        }
        
    }
}