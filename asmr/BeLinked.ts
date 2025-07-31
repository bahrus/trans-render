import { RoundaboutReady } from "../ts-refs/trans-render/froop/types";

export class BeLinked implements EventListenerObject {
    #srcRef: WeakRef<RoundaboutReady>;
    #destRef: WeakRef<any>;
    constructor(src: RoundaboutReady, public srcPath: string, dest: any, public destPath: string){
        dest[destPath] = (<any>src)[srcPath];
        this.#srcRef = new WeakRef<RoundaboutReady>(src);
        this.#destRef = new WeakRef<any>(dest);
        src.propagator!.addEventListener(srcPath, this);
    }

    handleEvent(object: Event): void {
        const src = this.#srcRef.deref(); if(!src) return;
        const dest = this.#destRef.deref(); if(!dest) return;
        dest[this.destPath] = (<any>src)[this.srcPath];
    }
}