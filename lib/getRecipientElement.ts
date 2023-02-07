import {INotify, EventSettings} from './types';


//very similar to be-observant.getElementToObserve
export async function getRecipientElement(self: Element, {toClosest, toNearestUpMatch, to, toSelf, tocoho, toUpShadow, navTo}: INotify){
    let recipientElement: EventTarget | null = null;// (<any>self).recipientElement;
    //if(recipientElement) return recipientElement;
    if(navTo){
        const {ScopeNavigator} = await import('./ScopeNavigator.js');
        const sn = new ScopeNavigator(self);
        return await sn.nav(navTo);
    }
    if(to || toUpShadow){
        const {upShadowSearch} = await import('./upShadowSearch.js');
        recipientElement = upShadowSearch(self, (to || toUpShadow) as string);
    }else if(toClosest !== undefined){
        recipientElement = self.closest(toClosest);
        if(recipientElement instanceof Element && toNearestUpMatch){
            const {upSearch} = await import('./upSearch.js');
            recipientElement = upSearch(recipientElement, toNearestUpMatch) as Element;
        }
    }else if(toNearestUpMatch !== undefined) {
        const {upSearch} = await import('./upSearch.js');
        recipientElement = upSearch(self, toNearestUpMatch) as Element;
    }else if(toSelf){
        recipientElement = self;
    }else{
        const {getHost} = await import('./getHost.js');
        recipientElement = getHost(self, tocoho); 
    }
    //(<any>self).recipientElement = recipientElement;
    return recipientElement;
}