export function dispatchEvent(src: EventTarget, name: string): Event{
    const evt = new Event(name);
    src.dispatchEvent(evt);
    return evt;
}