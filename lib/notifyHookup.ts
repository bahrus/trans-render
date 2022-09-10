import {INotify, IMinimalNotify, EventSettings, INotifyHookupInfo, IDIYNotify} from './types';
export async function notifyHookup(target: Element, key: string, minSettings: IMinimalNotify): Promise<INotifyHookupInfo>{
    const isPropSet = key.endsWith(':onSet');
    const propName = isPropSet ?  key.substr(0, key.length - 6) : undefined;
    let controller = new AbortController();
    const {doInit, eventListenerOptions, doOnly} = minSettings as IDIYNotify;
    const diy = doOnly !== undefined;
    const handler = async (e?: Event) => {
        const targetedNotification = minSettings as INotify ;
        const {doAction} = await import ('./doAction.js');
        const {getRecipientElement} = await import ('./getRecipientElement.js');
        const recipientElement = await getRecipientElement(target, targetedNotification);
        if(recipientElement !== null) await doAction(target, recipientElement, targetedNotification);
        const {thenDo} = targetedNotification;
        if(thenDo !== undefined) await thenDo(e);
    }
    if(doInit){
        if(diy){
            await doOnly();
        }else{
            await handler();
        }
    }

    if(isPropSet){
        const {bePropagating} = await import('./bePropagating.js');
        const et = await bePropagating(target, propName!);
        et.addEventListener(propName!, doOnly || handler, {signal: controller.signal});
    }else{
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
        target.addEventListener(key, doOnly || handler, options);
    }
    if(minSettings.nudge){
        const {nudge} = await import ('./nudge.js');
        nudge(target);
    }
    return {
        controller,
    };
}