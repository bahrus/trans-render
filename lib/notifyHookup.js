export async function notifyHookup(target, key, eventSettings) {
    const isPropSet = key.endsWith(':onSet');
    const propName = isPropSet ? key.substr(0, key.length - 6) : undefined;
    //let handler:  ((event: Event) => Promise<void>) | undefined = undefined;
    let controller = new AbortController();
    const { doInit, eventListenerOptions } = eventSettings;
    if (doInit) {
        const { doAction } = await import('./doAction.js');
        const { getRecipientElement } = await import('./getRecipientElement.js');
        const recipientElement = await getRecipientElement(target, eventSettings);
        if (recipientElement !== null)
            doAction(target, recipientElement, eventSettings);
        if (isPropSet && target.localName.includes('-')) {
            await customElements.whenDefined(target.localName);
        }
    }
    if (propName !== undefined) {
        const { bePropagating } = await import('./bePropagating.js');
        const et = await bePropagating(target, propName);
        et.addEventListener(propName, async () => {
            const { doAction } = await import('./doAction.js');
            const { getRecipientElement } = await import('./getRecipientElement.js');
            const recipientElement = await getRecipientElement(target, eventSettings);
            if (recipientElement !== null)
                doAction(target, recipientElement, eventSettings);
        }, { signal: controller.signal });
    }
    else {
        let options;
        switch (typeof eventListenerOptions) {
            case 'boolean':
                options = { capture: eventListenerOptions };
                break;
            case 'object':
                options = eventListenerOptions;
                break;
            default:
                options = {};
        }
        options.signal = controller.signal;
        target.addEventListener(key, async (e) => {
            const { doAction } = await import('./doAction.js');
            const { getRecipientElement } = await import('./getRecipientElement.js');
            const recipientElement = await getRecipientElement(target, eventSettings);
            if (recipientElement !== null)
                doAction(target, recipientElement, eventSettings, e);
        }, options);
    }
    if (eventSettings.nudge) {
        const { nudge } = await import('./nudge.js');
        nudge(target);
    }
    return {
        controller,
    };
}
