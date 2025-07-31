export class BeLinked {
    srcPath;
    destPath;
    #srcRef;
    #destRef;
    constructor(src, srcPath, dest, destPath) {
        this.srcPath = srcPath;
        this.destPath = destPath;
        dest[destPath] = src[srcPath];
        this.#srcRef = new WeakRef(src);
        this.#destRef = new WeakRef(dest);
        src.propagator.addEventListener(srcPath, this);
    }
    handleEvent(object) {
        const src = this.#srcRef.deref();
        if (!src)
            return;
        const dest = this.#destRef.deref();
        if (!dest)
            return;
        dest[this.destPath] = src[this.srcPath];
    }
}
