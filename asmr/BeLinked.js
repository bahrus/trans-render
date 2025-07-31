export class BeLinked {
    srcPath;
    destPath;
    #srcRef;
    #destRef;
    constructor(src, srcPath, dest, destPath) {
        this.srcPath = srcPath;
        this.destPath = destPath;
        //dest[destPath] = (<any>src)[srcPath];
        this.#srcRef = new WeakRef(src);
        this.#destRef = new WeakRef(dest);
        src.propagator.addEventListener(srcPath, this);
        this.handleEvent();
    }
    async handleEvent() {
        const src = this.#srcRef.deref();
        if (!src)
            return;
        const dest = this.#destRef.deref();
        if (!dest)
            return;
        const { srcPath, destPath } = this;
        const val = src[srcPath];
        if (destPath.startsWith(('?.'))) {
            (await import('../lib/setProp.js')).setProp(dest, destPath, val);
        }
        else {
            dest[this.destPath] = val;
        }
    }
}
