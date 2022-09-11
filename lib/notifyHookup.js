export async function notifyHookup(target, key, minSettings) {
    const isPropSet = key.endsWith(':onSet');
    const propName = isPropSet ? key.substr(0, key.length - 6) : undefined;
    let controller = new AbortController();
    const { doInit, eventListenerOptions, doOnly } = minSettings;
    const diy = doOnly !== undefined;
    const handler = async (target, key, minSettings, e) => {
        const targetedNotification = minSettings;
        const { doAction } = await import('./doAction.js');
        const { getRecipientElement } = await import('./getRecipientElement.js');
        const recipientElement = await getRecipientElement(target, targetedNotification);
        if (recipientElement !== null)
            await doAction(target, recipientElement, targetedNotification);
        const { thenDo } = targetedNotification;
        if (thenDo !== undefined)
            await thenDo(target, key, minSettings, e);
    };
    if (doInit) {
        if (diy) {
            await doOnly(target, key, minSettings);
        }
        else {
            await handler(target, key, minSettings);
        }
    }
    if (isPropSet) {
        const { bePropagating } = await import('./bePropagating.js');
        const et = await bePropagating(target, propName);
        et.addEventListener(propName, e => {
            (doOnly || handler)(target, key, minSettings, e);
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
        target.addEventListener(key, e => {
            (doOnly || handler)(target, key, minSettings, e);
        }, options);
    }
    if (minSettings.nudge) {
        const { nudge } = await import('./nudge.js');
        nudge(target);
    }
    return {
        controller,
    };
}
