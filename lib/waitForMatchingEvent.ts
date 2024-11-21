export function waitForMatchingEvent<TEvent extends Event = Event>(
    et: EventTarget, eventName: string, test: (evt: TEvent) => boolean,
    timeout: number = -1
): Promise<TEvent>{
    return new Promise((resolved, rejected) => {
        const ac = new AbortController();
        et.addEventListener(eventName, async e => {
            if(!test(e as TEvent)) return;
            ac.abort();
            resolved(e as TEvent);
        }, {signal: ac.signal});
    })
}