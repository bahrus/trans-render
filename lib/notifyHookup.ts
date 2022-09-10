import {INotify, IMinimalNotify, EventSettings, INotifyHookupInfo} from './types';
export async function notifyHookup(target: Element, key: string, minSettings: IMinimalNotify): Promise<INotifyHookupInfo>{
    const isPropSet = key.endsWith(':onSet');
    const propName = isPropSet ?  key.substr(0, key.length - 6) : undefined;
    let controller = new AbortController();
    const {doInit, eventListenerOptions, action} = minSettings;
    const minimal = action !== undefined;
    const handler = async (e?: Event) => {
        const {doAction} = await import ('./doAction.js');
        const {getRecipientElement} = await import ('./getRecipientElement.js');
        const recipientElement = await getRecipientElement(target, minSettings as EventSettings);
        if(recipientElement !== null) doAction(target, recipientElement, minSettings as EventSettings);
    }
    if(doInit){
        const {doAction} = await import ('./doAction.js');
        if(minimal){
            await action();
        }else{
            await handler();
        }
    }

    if(isPropSet){
        const {bePropagating} = await import('./bePropagating.js');
        const et = await bePropagating(target, propName!);
        et.addEventListener(propName!, action || handler, {signal: controller.signal});
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
        target.addEventListener(key, action || handler, options);
    }
    if(minSettings.nudge){
        const {nudge} = await import ('./nudge.js');
        nudge(target);
    }
    return {
        controller,
    };
}