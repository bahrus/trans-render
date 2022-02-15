import {INotify} from './types';
export async function notifyHookUp(host: Element, target: Element, key: string, eventSettings: INotify){
    const isPropSet = key.endsWith(':onSet');
    const propName = isPropSet ?  key.substr(0, key.length - 6) : undefined;
    if(eventSettings.doInit){
        const {doAction} = await import ('./doAction.js');
        const {getRecipientElement} = await import ('./getRecipientElement.js');
        const recipientElement = await getRecipientElement(host, eventSettings);
        if(recipientElement !== null) doAction(host, recipientElement, eventSettings);
        if(isPropSet &&  target.localName.includes('-')){
            await customElements.whenDefined(target.localName);
        }
        
    }
    if(propName !== undefined){
        const {subscribe} = await import ('./subscribe.js');
        subscribe(target, propName, async () => {
            const {doAction} = await import ('./doAction.js');
            const {getRecipientElement} = await import ('./getRecipientElement.js');
            const recipientElement = await getRecipientElement(host, eventSettings);
            if(recipientElement !== null) doAction(host, recipientElement, eventSettings);
        });
    }else{
        target.addEventListener(key, async e => {
            const {doAction} = await import ('./doAction.js');
            const {getRecipientElement} = await import ('./getRecipientElement.js');
            const recipientElement = await getRecipientElement(host, eventSettings);
            if(recipientElement !== null) doAction(host, recipientElement, eventSettings);
        }, eventSettings.eventListenerOptions);
    }
}