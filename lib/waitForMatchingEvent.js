export function waitForMatchingEvent(et, eventName, test, timeout = -1) {
    return new Promise((resolved, rejected) => {
        const ac = new AbortController();
        et.addEventListener(eventName, async (e) => {
            if (!test(e))
                return;
            ac.abort();
            resolved(e);
        }, { signal: ac.signal });
    });
}
