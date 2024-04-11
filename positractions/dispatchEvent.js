export function dispatchEvent(src, name) {
    const evt = new Event(name);
    src.dispatchEvent(evt);
    return evt;
}
