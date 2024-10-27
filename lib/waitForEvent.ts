export function waitForEvent<TEvent extends Event = Event>(et: EventTarget, eventName: string, failureEventName?: string): Promise<TEvent>{
    return new Promise((resolved, rejected) => {
        et.addEventListener(eventName, e => {
            resolved(e as TEvent);
        }, {once: true});
        if(failureEventName !== undefined){
            et.addEventListener(failureEventName, e => {
                rejected(e as TEvent);
            },  {once: true});
        }

    })
}