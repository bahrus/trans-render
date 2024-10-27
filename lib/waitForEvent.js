export function waitForEvent(et, eventName, failureEventName) {
    return new Promise((resolved, rejected) => {
        et.addEventListener(eventName, e => {
            resolved(e);
        }, { once: true });
        if (failureEventName !== undefined) {
            et.addEventListener(failureEventName, e => {
                rejected(e);
            }, { once: true });
        }
    });
}
