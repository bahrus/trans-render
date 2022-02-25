export async function notifyHookUp(target, key, eventSettings) {
    const isPropSet = key.endsWith(':onSet');
    const propName = isPropSet ? key.substr(0, key.length - 6) : undefined;
    let handler = undefined;
    if (eventSettings.doInit) {
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
        const { subscribe } = await import('./subscribe.js');
        subscribe(target, propName, async () => {
            const { doAction } = await import('./doAction.js');
            const { getRecipientElement } = await import('./getRecipientElement.js');
            const recipientElement = await getRecipientElement(target, eventSettings);
            if (recipientElement !== null)
                doAction(target, recipientElement, eventSettings);
        });
    }
    else {
        handler = async (e) => {
            const { doAction } = await import('./doAction.js');
            const { getRecipientElement } = await import('./getRecipientElement.js');
            const recipientElement = await getRecipientElement(target, eventSettings);
            if (recipientElement !== null)
                doAction(target, recipientElement, eventSettings, e);
        };
        target.addEventListener(key, handler, eventSettings.eventListenerOptions);
    }
    if (eventSettings.nudge) {
        const { nudge } = await import('./nudge.js');
        nudge(target);
    }
    return handler;
}
